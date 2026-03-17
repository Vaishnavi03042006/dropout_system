import { BrowserRouter as Router,Routes,Route } from "react-router-dom"

import Login from "./pages/Login"
import Signup from "./pages/Signup"
import StudentDashboard from "./pages/student/StudentDashboard"

function App(){

return(

<Router>

<Routes>

<Route path="/" element={<Login/>}/>
<Route path="/login" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>
<Route path="/student-dashboard" element={<StudentDashboard/>}/>

</Routes>

</Router>

)

}

export default App