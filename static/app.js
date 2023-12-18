url = "http://127.0.0.1:5000/api/v1.0/names"

d3.json(url).then(d => {
    //console.log(d.results[0])

    data = d.results

    statesSet = d3.group(data, d=> d.regions)
    categorySet = d3.group(data, d => d.category)

    //Group by the regions and the category names and find the sum of their deaths
    let groupDeathData = d3.rollups(data, v => d3.sum(v, d=>d.deaths), d=>d.regions, d=>d.category)
    //Group by regions and the category names and find the sum of their injuries
    let groupInjuryData = d3.rollups(data, v => d3.sum(v, d=>d.injuries), d=>d.regions, d=>d.category)

    console.log(groupDeathData)
    //////////////////////////////
    ///// Display First Data /////
    //////////////////////////////

    // Get the data for victoria 
    let victoria = groupDeathData[5]
    //console.log(Object.values(groupData)[5])

    // Get all the categories in a list 
    categoryList = []
    
    for (let i = 0; i<victoria[1].length;i++) {
        categoryList.push(victoria[1][i][0])
    }
    console.log(categoryList)

    // Get all the deaths for each category into an list
    deathData = [];

    for (let i = 0; i<victoria[1].length;i++) {
        deathData.push(victoria[1][i][1])
    };

    console.log(deathData);

    injuryData = [];
    categoryList = [];
    victoria = groupInjuryData[5]
    
    for (let i = 0; i<victoria[1].length;i++) {
        categoryList.push(victoria[1][i][0])
    }
    console.log(categoryList)
    for (let i = 0; i<victoria[1].length;i++) {
        injuryData.push(victoria[1][i][1])
    };

    console.log(injuryData);
    
    

    // let deathData = []
    // deathData.push()

    /////////////////////////////////////////////////
    ///// Create and Display Bar Graph Function /////
    /////////////////////////////////////////////////
    let myChart;
    function stateGraph(xvalue,yvalue,injuryValue) {
        var ctx = document.getElementById("myChart").getContext('2d');
        myChart = new Chart(ctx, {
            type:"bar",
            data:  {
                labels: yvalue,
                datasets: [
                    {
                    label: "death Total",
                    data: xvalue
                    }, 

                    {
                    label: "Injury Total",
                    data: injuryValue
                    }
            ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }}
        )

    };
///////////////////////////////
///// Check menu selection ////
///////////////////////////////

    // Selecting drop down menu from html code
    let button = d3.select("#statesFilter");

    // Checks if drop down menu was changed
    button.on("change", function(value) {
        optionChanged(this)}
        );

    function optionChanged(value) {
        selectElement = document.querySelector("#statesFilter");
        output = selectElement.value;
        console.log(typeof(output));
        deleteGraph();
        stateSelector(output);
        console.log(selectedStateData);
        dataSelector(selectedStateData);
        
        stateGraph(deathData,categoryList, injuryData)

        //Change selected data based on this
    }
    ////////////////////////////////////////////
    /////Function to select the right state/////
    ////////////////////////////////////////////
    
    function stateSelector(output) {
        for (let i = 0; i< groupDeathData.length;i++) {
            //console.log(groupData[i][0])
    
            if (output == groupDeathData[i][0]) {
                selectedStateData = groupDeathData[i][1]
                selectedInjuryData = groupInjuryData[i][1]
                return selectedStateData, selectedInjuryData
            }
        }
    }
    ////////////////////////////////////////////////////////////////
    ///// Function to grab the correct category and death list /////
    ////////////////////////////////////////////////////////////////

    function dataSelector(selectedStateData) {
        categoryList = []
        for (let i = 0; i<selectedStateData.length;i++) {
            categoryList.push(selectedStateData[i][0])
    };
        console.log(categoryList)

    // Get all the deaths for each category into an list
        deathData = [];
        for (let i = 0; i<selectedStateData.length;i++) {
            deathData.push(selectedStateData[i][1])
        };
        console.log(deathData)

    // Check Injury list
        categoryInjuryList = []
        for (let i = 0; i<selectedInjuryData.length;i++) {
            categoryInjuryList.push(selectedStateData[i][0])
    };

        console.log(categoryInjuryList);
    
    // Get all the injuries 
        injuryData = []
        for (let i = 0; i<selectedInjuryData.length;i++) {
            injuryData.push(selectedInjuryData[i][1])
        };

        console.log(injuryData);

        return deathData, injuryData, categoryList
    };

    ///////////////////////////////
    /////Delete previous graph/////
    ///////////////////////////////
    function deleteGraph() {
        if (myChart) {
            myChart.destroy();
    }
    };
    ////////////////////////
    /////Call functions/////
    ////////////////////////

    stateGraph(deathData,categoryList, injuryData);
    

}).catch(function(error) {
    console.log(error)
}) // end