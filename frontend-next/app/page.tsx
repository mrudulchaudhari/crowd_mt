import { MainLayout } from "@/src/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-blue">Welcome to Your Scaffold</h1>
          <p className="text-muted-foreground mt-2">
            A modern Next.js project with TypeScript, TailwindCSS, and all the tools you need.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-primary-blue">Primary Blue</CardTitle>
              <CardDescription>Main brand color</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full bg-primary-blue rounded-md"></div>
              <p className="text-sm text-muted-foreground mt-2">#0B64FF</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-success-green">Success Green</CardTitle>
              <CardDescription>Success states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full bg-success-green rounded-md"></div>
              <p className="text-sm text-muted-foreground mt-2">#22C55E</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-warning-yellow">Warning Yellow</CardTitle>
              <CardDescription>Warning states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full bg-warning-yellow rounded-md"></div>
              <p className="text-sm text-muted-foreground mt-2">#F59E0B</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-danger-red">Danger Red</CardTitle>
              <CardDescription>Error states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-16 w-full bg-danger-red rounded-md"></div>
              <p className="text-sm text-muted-foreground mt-2">#EF4444</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Features Included</CardTitle>
            <CardDescription>Everything you need to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2">Core Technologies</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Next.js 15 with App Router</li>
                  <li>✓ TypeScript</li>
                  <li>✓ TailwindCSS v4</li>
                  <li>✓ Inter Font</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Libraries & Tools</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>✓ Axios for API calls</li>
                  <li>✓ React Query for state management</li>
                  <li>✓ Lucide React icons</li>
                  <li>✓ React Leaflet for maps</li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Layout Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>✓ Responsive topbar with dark mode toggle</li>
                <li>✓ Collapsible sidebar navigation</li>
                <li>✓ Mobile-friendly design</li>
                <li>✓ Custom color theme system</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
