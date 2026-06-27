import { useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/app/providers/use-theme'
import { cn } from '@/lib/utils'
import {
  EmptyState,
  ErrorState,
  ForbiddenState,
  LoadingState,
  PageContainer,
  PageHeader,
  RoleBadge,
  StatusBadge,
  UploadButton,
} from '@/shared/ui'

const SWATCHES = [
  { name: 'background', className: 'bg-background border' },
  { name: 'foreground', className: 'bg-foreground' },
  { name: 'primary', className: 'bg-primary' },
  { name: 'secondary', className: 'bg-secondary' },
  { name: 'muted', className: 'bg-muted' },
  { name: 'destructive', className: 'bg-destructive' },
  { name: 'border', className: 'bg-border' },
] as const

const TYPE_SCALE = [
  { label: 'text-xs', className: 'text-xs' },
  { label: 'text-sm', className: 'text-sm' },
  { label: 'text-base', className: 'text-base' },
  { label: 'text-lg', className: 'text-lg' },
  { label: 'text-xl', className: 'text-xl' },
  { label: 'text-2xl', className: 'text-2xl' },
  { label: 'text-3xl', className: 'text-3xl' },
  { label: 'text-4xl', className: 'text-4xl' },
] as const

export function DesignSystemPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [uploadName, setUploadName] = useState<string | null>(null)

  return (
    <PageContainer className="py-8 pb-16">
      <PageHeader
        title="Design system"
        subtitle="Researchers.kz — tokens, typography, shadcn/ui components"
        actions={
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map((value) => (
              <Button
                key={value}
                size="sm"
                variant={theme === value ? 'default' : 'outline'}
                onClick={() => setTheme(value)}
              >
                {value}
              </Button>
            ))}
            <Badge variant="secondary">resolved: {resolvedTheme}</Badge>
          </div>
        }
      />

      <div className="mt-8 flex flex-col gap-10">
        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Color palette</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            HSL tokens from design spec — primary blue meets WCAG AA on white/dark backgrounds.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {SWATCHES.map(({ name, className }) => (
              <div key={name} className="flex flex-col gap-2">
                <div className={cnSwatch(className)} />
                <span className="text-xs text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Typography</h2>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            Inter (sans) · JetBrains Mono (code)
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {TYPE_SCALE.map(({ label, className }) => (
              <p key={label} className={className}>
                {label} — Researchers design system
              </p>
            ))}
            <p className="page-title">Page title — text-3xl font-semibold tracking-tight</p>
            <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm">
              const lessonId = &apos;abc123&apos;
            </code>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Buttons</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>default</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="outline">outline</Button>
            <Button variant="ghost">ghost</Button>
            <Button variant="destructive">destructive</Button>
            <Button variant="link">link</Button>
          </div>
          <div className="mt-4">
            <Button onClick={() => toast.success('Toast example')}>Show toast</Button>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Form controls</h2>
          <div className="mt-6 grid max-w-xl gap-4">
            <div className="grid gap-2">
              <Label htmlFor="demo-input">Input</Label>
              <Input id="demo-input" placeholder="Lesson title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="demo-textarea">Textarea</Label>
              <Textarea id="demo-textarea" placeholder="Lesson content brief" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label>Select</Label>
              <Select defaultValue="ru">
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="kz">Қазақша</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <UploadButton
              accept="image/*"
              maxSizeMb={5}
              label="Upload cover"
              onSelect={(file) => setUploadName(file.name)}
            />
            {uploadName && (
              <p className="text-sm text-muted-foreground">Selected: {uploadName}</p>
            )}
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Card &amp; data</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Card className="surface-card ring-0">
              <CardHeader>
                <CardTitle>Course card</CardTitle>
                <CardDescription>rounded-2xl · border · shadow-sm</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={66} className="h-2" />
              </CardContent>
              <CardFooter>
                <Button size="sm">Continue</Button>
              </CardFooter>
            </Card>

            <div className="overflow-hidden rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Intro</TableCell>
                    <TableCell>
                      <StatusBadge status="PUBLISHED" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Draft module</TableCell>
                    <TableCell>
                      <StatusBadge status="DRAFT" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Overlays</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
                Dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm action</DialogTitle>
                  <DialogDescription>Dialog content uses card foreground colors.</DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton={false}>
                  <Button>OK</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
                Sheet
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Side panel</SheetTitle>
                </SheetHeader>
                <p className="px-4 text-sm text-muted-foreground">Mobile-friendly drawer pattern.</p>
              </SheetContent>
            </Sheet>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className={cn(buttonVariants({ variant: 'outline' }))}>
                  Tooltip
                </TooltipTrigger>
                <TooltipContent>Helpful hint</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Tabs &amp; badges</h2>
          <Tabs defaultValue="author" className="mt-6">
            <TabsList>
              <TabsTrigger value="author">Author</TabsTrigger>
              <TabsTrigger value="subscriber">Subscriber</TabsTrigger>
            </TabsList>
            <TabsContent value="author" className="flex gap-2 pt-4">
              <RoleBadge role="AUTHOR" />
              <RoleBadge role="ADMIN" />
            </TabsContent>
            <TabsContent value="subscriber" className="pt-4">
              <RoleBadge role="SUBSCRIBER" />
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex items-center gap-3">
            <Avatar>
              <AvatarFallback>RS</AvatarFallback>
            </Avatar>
            <Badge>Default badge</Badge>
            <Skeleton className="h-8 w-24" />
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="page-title text-2xl">Screen states</h2>
          <div className="mt-6 grid gap-8 lg:grid-cols-2">
            <div className="rounded-xl border border-dashed p-4">
              <EmptyState
                title="No courses yet"
                description="Create your first course in Studio."
                action={{ label: 'Create course', onClick: () => undefined }}
              />
            </div>
            <div className="rounded-xl border border-dashed p-4">
              <ErrorState message="Network error" onRetry={() => toast.message('Retry clicked')} />
            </div>
            <div className="rounded-xl border border-dashed p-4 lg:col-span-2">
              <ForbiddenState
                title="Subscription required"
                description="Purchase access to chat with the lesson assistant."
                action={{ label: 'Browse catalog', onClick: () => undefined }}
              />
            </div>
          </div>
          <div className="mt-6 rounded-xl border border-dashed p-4">
            <LoadingState />
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

function cnSwatch(className: string) {
  return `h-12 w-full rounded-lg ${className}`
}
