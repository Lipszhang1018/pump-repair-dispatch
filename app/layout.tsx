import './globals.css'

export const metadata = {
  title: '泵房检修派单系统',
  description: '泵房报警人工分派系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="header">
          <div className="container">
            <h1>泵房检修派单系统</h1>
            <nav className="header-nav">
              <a href="/orders">派单列表</a>
              <a href="/orders/new">新建派单</a>
              <a href="/personnel">人员监控</a>
              <a href="/map">地图视图</a>
            </nav>
          </div>
        </header>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  )
}
