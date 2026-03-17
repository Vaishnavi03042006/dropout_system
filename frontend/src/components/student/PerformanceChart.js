import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from "recharts"

const data=[
{subject:"Math",marks:82},
{subject:"AI",marks:75},
{subject:"ML",marks:80},
{subject:"DBMS",marks:70},
{subject:"OS",marks:78}
]

export default function PerformanceChart(){

return(

<div className="bg-white p-6 rounded-xl shadow">

<h2 className="text-lg font-semibold mb-4">
Academic Performance
</h2>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="subject"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="marks" stroke="#285A48" strokeWidth={3}/>

</LineChart>

</ResponsiveContainer>

</div>

)

}