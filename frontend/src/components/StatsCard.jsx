const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className="card">
      <div className="flex items-center w-fit ">
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
        <div className="ml-4">
          <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
          <p className="lg:text-xl text-sm font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default StatsCard

