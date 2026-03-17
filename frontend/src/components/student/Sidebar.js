import { FaChartLine, FaUserGraduate, FaMoneyBillWave, FaBook } from "react-icons/fa"

export default function Sidebar(){

return(

<div className="w-64 bg-gradient-to-b from-[#091413] to-[#285A48] text-white flex flex-col">

<div className="text-2xl font-bold p-6 border-b border-white/20">
Student Portal
</div>

<nav className="flex-1 p-4 space-y-4">

<a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
<FaChartLine/> Dashboard
</a>

<a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
<FaBook/> Results
</a>

<a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
<FaUserGraduate/> Attendance
</a>

<a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
<FaMoneyBillWave/> Fees
</a>

<a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
<FaChartLine/> Risk Analysis
</a>

</nav>

</div>

)

}