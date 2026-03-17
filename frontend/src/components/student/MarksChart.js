import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer} from "recharts"

const data=[
{subject:"Math",marks:82},
{subject:"AI",marks:75},
{subject:"ML",marks:80},
{subject:"DBMS",marks:70},
{subject:"OS",marks:78},
]

export default function MarksChart(){

return(

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="text-lg font-semibold mb-4">
Academic Performance
</h3>

<ResponsiveContainer width="100%" height={300}>

<LineChart data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="subject"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="marks" stroke="#408A71"/>

</LineChart>

</ResponsiveContainer>

</div>

)

}