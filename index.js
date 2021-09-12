const express=require('express');
const axios = require('axios');
const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening at port ${port}`));

const calculateDate =  ()=>{
    // initialize new date
    var d =  new Date()
    var month =d.getMonth();
    //month is from 0 to 11 so it's already shifted back
    //check if month is 0 that means we are in first month and we need to calculate starting month 12
    if(month==0){
        month = 12
    }
    var year = d.getFullYear();
    var day = d.getDate();

    //calculating excactly 30 days
    var lastDay=  new Date(year,month,0).getDate();
    if(day == 31){
        day =1
    }else if (lastDay==31  ){
        day=day+1
    }else if(lastDay=28 ){
        day=day-2
    }
    if(month!=10 || month!=11 || month!=12){
        month=`0${month}`
    }
    if(day.toString().length===1){
       day=`0${day}`
    }
    const date = `${year}${month}${day}`

    return date
}

const fetchGithub = async(req,res)=>{

  //first we calculate date of exactly 30 days back
  const date = calculateDate()

   //start our request for 100 record
   await axios.get(`https://api.github.com/search/repositories?q=created:%3E${date}&language=python&sort=stars&order=desc&per_page=100`)
        .then((result)=>{
           // our first array that holds all 100 record's data
            const arr1= result.data.items
           //only selecting languages of those items
            const arr2 = arr1.map(item =>item.language);
           // having only unique values as languages may be duplicated
            unique = [...new Set(arr2)]
           // extracting all repo names from our list
            var repoList=[];
            for (y in unique){
                for(i in arr1){
                if(unique[y] == arr1[i].language){
                     repoList.push({language:unique[y],listOfRepos:[arr1[i].full_name]})
                }
            }}
            //merging our 2 arrays into one array that has final result
            var finalList=[]
            var z=-1
            for(i in repoList){
                //select only first language to push to our new list
                if(i == 0 || repoList[i].language !=repoList[i-1].language){
                finalList.push(repoList[i])
                //counter of internal list that holds repo names
                z=z+1
                //counter of all repos in one language
                var count = 0
                }
                else{
                    //push to the repo name if the language is aleardy in the list
                    finalList[z].listOfRepos.push(repoList[i].listOfRepos[0])
                    count = count+1

                }
                //final number of repos
                finalList[z].numberOfRepos= count+1
            }
            res.send(finalList)
        })
        .catch(err=>console.log('error',err))

}


app.get("/",fetchGithub)
