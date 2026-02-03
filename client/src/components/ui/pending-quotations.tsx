import React from 'react'
import { Card, CardContent } from './card'

export type QuotationItem = {
  id: string
  productSku: string
  productTitle: string
  requestedQuantity: number
  supplierStock: number // quantos o fornecedor tem no momento
  committedQuantity?: number // quantidade já comprometida/confirmada
  deliveryDeadline?: string // ISO date when remaining quantity will be delivered
}

type Props = {
  items?: QuotationItem[]
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString()
  } catch {
    return iso
  }
}

export const PendingQuotations: React.FC<Props> = ({ items = [] }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Cotações Pendentes</h2>
      {items.length === 0 && (
        <div className="text-muted-foreground text-sm">Nenhuma cotação pendente</div>
      )}

      <div className="space-y-3">
        {items.map((it) => {
          const committed = it.committedQuantity ?? 0
          const availableNow = Math.max(0, it.supplierStock - committed)
          // quanto da quantidade total vai faltar agora
          const missingTotal = Math.max(0, it.requestedQuantity - (it.supplierStock))

          return (
            <Card key={it.id} data-testid={`pq-item-${it.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-semibold">
                        {it.productTitle}
                        <span className="text-muted-foreground text-xs ml-2 font-normal">
                          {it.productSku}
                        </span>
                      </p>
                    </div>
                    <div className="flex gap-6 flex-wrap">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Solicitado</p>
                        <p className="text-base font-bold">{it.requestedQuantity}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Disponível agora</p>
                        <p className="text-base font-bold">{availableNow}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Faltará</p>
                        <p className="text-base font-bold text-destructive">{missingTotal}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 md:text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Prazo entrega restante</p>
                      <p className="font-semibold">{formatDate(it.deliveryDeadline)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default PendingQuotations
