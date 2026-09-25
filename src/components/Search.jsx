import { useState } from "react";
import { Search} from "lucide-react";
import Linegraph from "./Linegraph";
import Donutgraph from "./Donutgraph";


const Searchh = () => {
  const [submit, setSubmit] = useState(false)
  const [username, setUsername] = useState('')
  const [userData, setUserData] = useState(null)
  const [count, setCount] = useState(0)
  const [aiInsights, setaiInsights] = useState(null)
  // shows insights starts at null as at first in the render there will be no insights
  const [loadingAI, setLoadingAI] = useState(false)
  // shows if the insights are loading or not

  const fetchUser=async (name)=>{

    try{
        const response = await fetch(`https://api.github.com/users/${name}`);
        const data=await response.json();
        setUserData(data);
        console.log(data);

        const total= await fetch(`https://pinned.berrysauce.dev/get/${name}`)
        const total_count= await total.json()
        setCount(total_count.length)

        const repos= await fetch(`https://api.github.com/users/${name}/repos?per_page=30&sort=updated`)
        const repoData=await repos.json()
        console.log("helloooo",repoData)

        let clean=[]
        //.filter() keeps whatever evaluates to true.
        clean=repoData.filter((repo)=> !repo.fork).slice(0,10).map((repo)=>{
          return{
            name: repo.name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            homepage: repo.homepage,
            lastUpdated: repo.pushed_at,
          }
        })
        fetchingai(clean, data);
        //giving this function the clean repo and the userProfile
      }



//           Data Pipeline Summary
// Starting Point (Raw Data): GitHub returns one single array containing repository objects, where each object holds 70 to 80 raw key: value pairs.

// Filtering (.filter()): Evaluates a boolean condition (true or false). It keeps only original repositories (fork === false) and discards the forks (fork === true). It does not alter object counts based on index positions—only based on whether they meet the condition.

// Slicing (.slice(0, 10)): Operates purely on indices without evaluating object contents or boolean states. It extracts items from index 0 up to (but not including) index 10, capping the array at a maximum of 10 repository objects.

// Mapping (.map()): Iterates over the 10 sliced objects and extracts only the 5 to 6 essential key: value pairs needed for the AI prompt, discarding the rest of the 70+ properties.


    catch(error){
        console.error(error);
    }
  }



  const fetchingai=async (repo,userProfile)=>{ //taking the cleaned repo as well as the userProfile
    setLoadingAI(true) //setting it to true once it is in the function
    try{
      // giving it a system prompt to act like a certain person
      const systemPrompt = `You are an expert technical auditor analyzing a GitHub profile.   
Assess the provided profile details and repositories to generate insights.
Respond ONLY with a valid, raw JSON object (no markdown backticks, no markdown fence, no preamble, no trailing text) matching this schema:
{
  "archetype": {
    "title": "e.g. Full-Stack Product Engineer",
    "description": "Short 1-2 sentence justification"
  },
  "maturity": {
    "productionCount": 0,
    "experimentalCount": 0,
    "productionProjects": [
      {
        "name": "repository-name",
        "reason": "Why this qualifies as production-grade"
      }
    ],
    "verdict": "Short summary evaluating original production products vs tutorial/sandbox projects"
  },
  "codeHealth": {
    "score": 85,
    "summary": "1-2 sentences assessing longevity, maintenance frequency, and project activity"
  }
}`;

// giving it the infos of userprofile

    const userPrompt = `Profile:
- Username: ${userProfile.login}
- Bio: ${userProfile.bio || "No bio"}
- Public Repos: ${userProfile.public_repos}
- Member Since: ${userProfile.created_at}


Recent Repositories:
${JSON.stringify(repo, null, 2)}`;
// giving it the infos of the repo that i cleaned as well in stringify as it can't read arrays

// JSON.stringify(valueToConvert, replacerFunction, indentationSpacing)
// replacerfunction: in here u can write some custom filter function but right now i don't want any so i did null
// Indentation is separating one object from the next in the array



const response= await fetch(`https://api.groq.com/openai/v1/chat/completions`,{
  // now i am fetching it calling its endpoints
  method: "POST", //method post as i am posting my datas to the ai in github i was getting the datas
      headers: {
        "Content-Type": "application/json", //otherwise it will take everything as text thats why i need to tell it specifically that I have parded it down use it
        Authorization: `Bearer ${import.meta.env.VITE_GROK_API_KEY_PLAYGROUND}`, //giving it the api key
      },
      body: JSON.stringify({ 
        // as it can't read arrays and objects i am stringify it and actually here i am sending all the infos with the model name
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        //orces the AI to output strictly valid JSON syntax as text (no chatter, no markdown fences).
        temperature: 0.2, // how much creative will the ai be 0.1-0.3 precise 0.8-.10 very creative
      }),
    })
     const result = await response.json();
      console.log("Raw Grok Result:", result)
      console.log("Loaded Key:", import.meta.env.VITE_GROK_API_KEY_PLAYGROUND);


      // choices: An array containing the model's generated outputs (by default, it produces 1 choice, located at index 0).

// message: An object containing the role ("assistant") and the body of the reply.

// content: The actual text generated by the AI based on your prompt.
      if (result.choices && result.choices[0]?.message?.content) {
        // ok so grok sends a package it has chouces message and content and the safequard checks it before giving it to my codebase. if it dosen't then there will me error in place of choices
        const parsed = JSON.parse(result.choices[0].message.content);
        setaiInsights(parsed);
        // so it's a safeguard. We will see if there is any message. If there is a message, then we will convert it to JSON, and then we will just set it. 
      }
}
    catch(err){
      console.error("Not Found",err)
    }
    finally{
      setLoadingAI(false)
    }

  }

  

  return (
    <div className="body1">
      <div className={submit ? "searchtop" : "search"}>
        <form onSubmit={(e)=>{
            e.preventDefault();
            if(username.trim()===""){
              setSubmit(false)
            }
            else{
              setSubmit(true)
              fetchUser(username)
              // setUsername('')
            }
        }}
        className='first'>

    <div className="input-wrapper">
    <span className="url-prefix">https://github.com/</span>
    <input
      className="input"
      type="text"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  </div>
    <button className="button"><Search size={35} strokeWidth={3.25} /> </button>
  </form>
  </div>
  <br/><br/>

    {userData && (
      <div className="container">

  {/* LEFT 50% */}
  <div className="left">
    {/* contains the whole left content also includes graphs */}

    <div className="profile-row">
      {/* it covers uptill right side stats */}

      {/* PROFILE INFORMATION */}
      <div className="profile-header">
        {/* covers whole of profile info thats it  */}

        <div className="profile-info">
          {/* uptill acc type it covers */}

        <img
          src={userData.avatar_url}
          alt="DP"
          className="dp"
        />

        <div className="identity">
          <p className="name">
            Identity: {userData.name || userData.login}
          </p>

          <p className="handle">
            @{userData.login}
          </p>
        </div>

        {userData.bio && (
          <p className="bio">
            Bio: {userData.bio}
          </p>
        )}

        {userData.blog && (
          <p className="bio">
            Blog: {userData.blog}
          </p>
        )}

        {userData.company && (
          <p className="bio">
            Company: {userData.company}
          </p>
        )}

        <div className="meta-data">
          {userData.location && (
            <p className="location">
              Location: {userData.location}
            </p>
          )}

          {userData.twitter_username && (
            <p className="twitter">
              Twitter: {userData.twitter_username}
            </p>
          )}
        </div>

        {userData.email && (
          <p className="type">
            Email: {userData.email}
          </p>
        )}

        <p className="type">
          Acc_type: {userData.user_view_type}
        </p>

      </div>
      {/* GITHUB STATS — SAME LEFT COLUMN */}
      <div className="github-stats">

        <p className="created">
          Joined: {new Date(userData.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        <p className="follow">
          Followers: {userData.followers}, Following: {userData.following}
        </p>

        <p className="repos">
          Public-Repositories: {userData.public_repos}
        </p>

        <p className="id">
          Pinned-Repositories: {count}
        </p>

      </div>

    </div>



  </div>
      {/* <div className="profile-info">

        <img
          src={userData.avatar_url}
          alt="DP"
          className="dp"
        />

        <div className="identity">
          <p className="name">
            Identity: {userData.name || userData.login}
          </p>

          <p className="handle">
            @{userData.login}
          </p>
        </div>

        {userData.bio && (
          <p className="bio">
            Bio: {userData.bio}
          </p>
        )}

        {userData.blog && (
          <p className="bio">
            Blog: {userData.blog}
          </p>
        )}

        {userData.company && (
          <p className="bio">
            Company: {userData.company}
          </p>
        )}

        <div className="meta-data">
          {userData.location && (
            <p className="location">
              Location: {userData.location}
            </p>
          )}

          {userData.twitter_username && (
            <p className="twitter">
              Twitter: {userData.twitter_username}
            </p>
          )}
        </div>

        {userData.email && (
          <p className="type">
            Email: {userData.email}
          </p>
        )}

        <p className="type">
          Acc_type: {userData.user_view_type}
        </p>

      </div> */}


      {/* GITHUB STATS — SAME LEFT COLUMN
      <div className="github-stats">

        <p className="created">
          Joined: {new Date(userData.created_at).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>

        <p className="follow">
          Followers: {userData.followers}, Following: {userData.following}
        </p>

        <p className="repos">
          Public-Repositories: {userData.public_repos}
        </p>

        <p className="id">
          Pinned-Repositories: {count}
        </p>

      </div>

    </div> */}


    {/* GRAPHS */}
    <div className="graph">
      <Linegraph userData={userData.login}/>
      <Donutgraph userData={userData.login}/>
    </div>

  </div>
      



        <div className="rightt">
          {loadingAI && (
            <div className="ai-loading">
              <p>Analyzing GitHub footprint...</p>
            </div>
          )}
          {/* Only render this card when the AI is NOT loading (!loadingAI) AND we actually have insights ready (aiInsights). */}
          {!loadingAI && aiInsights && (
            <div className="ai-card">
              <div className="archetype-section">
                <span className="badge"><h1>Who is this Person?</h1></span>
                <h2>{aiInsights.archetype?.title}</h2>
                <h3>{aiInsights.archetype?.description}</h3>
              </div>
              <hr />

              <div className="maturity-section">
                <h1>What Kind of Projects they have?</h1>
                <div className="counts">
                  <span> <h3>Production: <strong>{aiInsights.maturity?.productionCount}</strong> , Experimental: <strong>{aiInsights.maturity?.experimentalCount}</strong></h3> </span>
                  {/* <span>Experimental: <strong>{aiInsights.maturity?.experimentalCount}</strong></span> */}
                </div>
                <h4>{aiInsights.maturity?.verdict}</h4>
                {/* from here i didn't understand */}
                
                {aiInsights.maturity?.productionProjects?.length > 0 && (
               <div className="production-links">
      <h4>Highlighted Production Projects:</h4>
      <ul>
        {aiInsights.maturity.productionProjects.map((project, index) => (
          <li key={index}>
            <a
              href={`https://github.com/${userData.login}/${project.name}`}
              target="_blank"
              rel="noreferrer"
            >
              {project.name}
            </a>
            {project.reason && <span className="reason"> — {project.reason}</span>}
          </li>
        ))}
      </ul>
    </div>
  )}
              </div>

              <hr />
              <div className="health-section">
                <div className="score-header">
                  <span className="score-pill"><h2>Code Health: {aiInsights.codeHealth?.score}/ 100</h2></span>
                </div>
                <h4>{aiInsights.codeHealth?.summary}</h4>
              </div>
        </div>
          )}
  </div>
  </div>
    )}
    </div>
  )
}

export default Searchh
