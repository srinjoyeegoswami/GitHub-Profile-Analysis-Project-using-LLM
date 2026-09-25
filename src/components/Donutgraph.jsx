import { useEffect, useState } from "react"
import { Doughnut } from "react-chartjs-2";

const Donutgraph = ({userData}) => {
  const [initial, setInitial] = useState()
  useEffect(()=>{
    if(!userData) return;
    const fetchUser= async()=>{
      try{
        const res= await fetch(`https://api.github.com/users/${userData}/repos?per_page=100`)
        const getting=await res.json()
        console.log(getting)

        const count={}
        getting.forEach((repo)=>{
          const lang=repo.language || 'Miscellaneous';
//or
//let lang;
// if (repo.language) {
//   lang = repo.language;
// } else {
//   lang = "Miscellaneous";
// }
          if(count[lang]){
            count[lang]=count[lang]+1;
            // like python: 1,2 like this
          }
          else{
            count[lang]=1
          }
        })
        console.log(count)
        setInitial(count)
      }
      catch(error){
        console.log("Sorry Not found",error)
      }

    }
    fetchUser()
  },[userData])
  return (
    <div className="donut">
      {initial? (
        <Doughnut
        data={{
          labels: Object.keys(initial),
          datasets:[{
            label:"Repositories",
            data: Object.values(initial),
            backgroundColor: [
              "#38bdf8",
              "#818cf8",
              "#c084fc",
              "#f472b6",
              "#fb7185",
              "#34d399",
            ],
            borderWidth: 1,

          }]

        }}
        
        options={{
        responsive: true,
        maintainAspectRatio: false,
      }}
      />):(
        <p>Loading...</p>
      )
      }
    </div>
  )
}

export default Donutgraph
