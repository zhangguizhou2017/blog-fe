'use client'

import { WalletInfo } from '@/components/wallet-info'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletPage() {
  const { isConnected } = useAccount()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Web3 钱包</h1>
          <p className="text-muted-foreground">
            连接你的钱包并查看详细信息
          </p>
        </div>

        {!isConnected && (
          <Card>
            <CardHeader>
              <CardTitle>开始使用</CardTitle>
              <CardDescription>
                点击下方按钮连接你的 Web3 钱包
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ConnectButton />
            </CardContent>
          </Card>
        )}

        {isConnected && (
          <div className="grid gap-6 md:grid-cols-2">
            <WalletInfo />

            <Card>
              <CardHeader>
                <CardTitle>功能说明</CardTitle>
                <CardDescription>当前支持的功能</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">✅ 已实现</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>连接/断开钱包</li>
                    <li>显示钱包地址</li>
                    <li>显示账户余额</li>
                    <li>显示 ENS 名称</li>
                    <li>显示当前网络</li>
                    <li>切换网络</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">🚀 可扩展功能</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>发送交易</li>
                    <li>签名消息</li>
                    <li>智能合约交互</li>
                    <li>NFT 展示</li>
                    <li>交易历史</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
