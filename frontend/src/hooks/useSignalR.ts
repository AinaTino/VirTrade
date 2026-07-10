import { useEffect, useRef, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import type { ConnectionStatus } from '../types'

type Handler = (payload: unknown) => void

class HubProxy {
  private handlers = new Map<string, Set<Handler>>()
  private conn: signalR.HubConnection | null = null
  private startPromise: Promise<void> | null = null
  state: ConnectionStatus = 'disconnected'

  on(event: string, cb: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(cb)
    if (this.conn) this.conn.on(event, cb)
  }

  off(event: string, cb: Handler) {
    this.handlers.get(event)?.delete(cb)
    if (this.conn) this.conn.off(event, cb)
  }

  async invoke(method: string, ...args: unknown[]) {
    if (!this.conn) {
      // ensure we attempt to start and wait for result
      await this.start()
    }

    if (!this.conn) throw new Error('Connection not started')

    // If the connection isn't in Connected state, wait for startPromise if present
    const state = (this.conn as any).state
    if (state !== undefined && state !== signalR.HubConnectionState.Connected) {
      if (this.startPromise) await this.startPromise
    }

    return this.conn.invoke(method, ...args)
  }

  async start() {
    if (this.state === 'connected' || this.state === 'connecting') return this.startPromise ?? Promise.resolve()

    this.state = 'connecting'

    // Create a start promise so concurrent callers wait for the same attempt
    this.startPromise = (async () => {
      const conn = new signalR.HubConnectionBuilder()
        .withUrl((import.meta.env.VITE_WS_URL || window.location.origin) + '/hubs/bourse', {
          accessTokenFactory: () => localStorage.getItem('virtrade_jwt') ?? '',
          transport: signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .build()

      this.conn = conn

      // rebind existing handlers once connected
      this.handlers.forEach((set, event) => {
        set.forEach((cb) => conn.on(event, cb))
      })

      // attach onclose to update state
      conn.onclose(() => {
        this.state = 'disconnected'
        this.conn = null
      })

      // retry loop
      const maxAttempts = 3
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          await conn.start()
          this.state = 'connected'
          this.startPromise = null
          return
        } catch (e) {
          if (attempt === maxAttempts) {
            this.state = 'disconnected'
            this.conn = null
            this.startPromise = null
            throw e
          }
          // small backoff
          await new Promise((r) => setTimeout(r, 400 * attempt))
        }
      }
    })()

    return this.startPromise
  }

  async stop() {
    if (this.conn) {
      await this.conn.stop()
      this.conn = null
    }
    this.state = 'disconnected'
  }
}

export function useSignalR() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const proxyRef = useRef<HubProxy | null>(null)
  const startedRef = useRef(false)

  if (!proxyRef.current) proxyRef.current = new HubProxy()

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    setStatus('connecting')
    const p = proxyRef.current!
    p.start()
      .then(() => setStatus('connected'))
      .catch(() => setStatus('disconnected'))

    return () => {
      p.stop().catch(() => {})
    }
  }, [])

  return { connection: proxyRef.current!, status }
}
