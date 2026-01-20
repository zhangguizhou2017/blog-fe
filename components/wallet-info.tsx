'use client'

import { useAccount, useBalance, useEnsName } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
  })
  const { data: ensName } = useEnsName({ address })

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>钱包信息</CardTitle>
          <CardDescription>请先连接钱包</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>钱包信息</CardTitle>
        <CardDescription>当前连接的钱包详情</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">网络</span>
            <Badge variant="outline">{chain?.name || '未知网络'}</Badge>
          </div>

          {ensName && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">ENS 名称</span>
              <span className="text-sm text-muted-foreground">{ensName}</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-sm font-medium">钱包地址</span>
            <div className="flex items-center gap-2">
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </code>
              <button
                onClick={() => {
                  if (address) {
                    navigator.clipboard.writeText(address)
                  }
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                复制
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">余额</span>
            {balanceLoading ? (
              <Skeleton className="h-5 w-24" />
            ) : (
              <span className="text-sm font-mono">
                {balance?.formatted ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
