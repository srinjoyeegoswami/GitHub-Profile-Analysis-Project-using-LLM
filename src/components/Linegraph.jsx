import { useEffect, useState } from "react"
import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const Linegraph = ({userData}) => {
  console.log("--> Linegraph rendered! Props received:", {userData});
   const [initial, setinitial] = useState(null)

   useEffect(()=>{
    if(!userData) return;
    const fetchData= async()=>{
      try{
        const res= await fetch(`https://github-contributions-api.jogruber.de/v4/${userData}`)
        const data= await res.json()
        console.log(data.total)
        setinitial(data.total)
      }
      catch(err){
        console.error("Failed to fetch contribution data:", err);
      }
      
    }
    fetchData()
   },[userData])
  return (
    <div className="Line">
    {initial? 
    (
      <Line
       data={{
        labels: Object.keys(initial),
        datasets:[{
          label: "Yearly Contributions",
          data: Object.values(initial),
          borderColor: "#38bdf8",
          backgroundColor: "rgba(83, 28, 246, 0.16)",
          tension: 0.1,
          fill: true,
        }]
      }}
      options={{
        responsive: true, // so that the graph is responsive in all the devices
        maintainAspectRatio: false, // so that the graph don't get restricted to 2:1 width:height and can take as much height and width it needs
        scales: {
          x:{
            grid:{
              display: true,
              // color:"white",
            },
          },
        y: {
          beginAtZero: true,
          min: 0,
          grid: {
            display: true,
            // color:"white",
          },
          ticks: {
            stepSize: 100, // moves 0, 100, 200, 300, 400...
            maxTicksLimit: 15, // Allows room for up to 15 tick labels
          },
        },
      },
      }}
      />
    ):(
      <p className="loading">Loading...</p>
    )}
    </div> 
  )
}

export default Linegraph
