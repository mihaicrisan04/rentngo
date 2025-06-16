export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Welcome to the Rent'n Go admin dashboard
        </p>
      </div>
      
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Vehicle Statistics</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Reservation Statistics</p>
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Revenue Statistics</p>
        </div>
      </div>
      
      <div className="bg-muted/50 min-h-[400px] rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Recent Activity</p>
      </div>
    </div>
  )
}
