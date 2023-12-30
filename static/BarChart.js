url = "http://127.0.0.1:5000/get_data"

document.addEventListener('DOMContentLoaded', function() {
    d3.json(url).then(d => {
        //console.log(d.results[0])
        data = d.results

        statesSet = d3.group(data, d=> d.regions)
        categorySet = d3.group(data, d => d.category)

        //Group by the regions and the category names and find the sum of their deaths
        let groupDeathData = d3.rollups(data, v => d3.count(v, d=>d.deaths), d=>d.regions, d=>d.category)
        //Group by regions and the category names and find the sum of their injuries
        let groupInjuryData = d3.rollups(data, v => d3.sum(v, d=>d.injuries), d=>d.regions, d=>d.category)

        console.log(groupDeathData)
        //////////////////////////////
        ///// Display First Data ///// SO WE CAN HAVE THE BARGRAPH DISPLAYED STRAIGHTAWAY WHEN THE WEBPAGE IS LOADED
        //////////////////////////////

        // Get the data for victoria 
        let victoria = groupDeathData[5]

        // Get all the categories into a list 
        categoryList = []
        
        for (let i = 0; i<victoria[1].length;i++) {
            categoryList.push(victoria[1][i][0])
        }

        // Get all the deaths for each category into a list
        deathData = [];

        for (let i = 0; i<victoria[1].length;i++) {
            deathData.push(victoria[1][i][1])
        };

        //Change victoria to dataset with injuries values
        victoria = groupInjuryData[5]

        // Get the injury and category into a list
        categoryList = [];
        for (let i = 0; i<victoria[1].length;i++) {
            categoryList.push(victoria[1][i][0])
        }

        injuryData = [];
        for (let i = 0; i<victoria[1].length;i++) {
            injuryData.push(victoria[1][i][1])
        };

        /////////////////////////////////////////////////
        ///// Create and Display Bar Graph Function /////
        /////////////////////////////////////////////////
        
        //Define myChart for global usage
        let myChart;

        //Function stateGraph
        function stateGraph(xvalue,yvalue,injuryValue) {
            var ctx = document.getElementById("myChart").getContext('2d');
            myChart = new Chart(ctx, {
                type:"bar",
                data:  {
                    labels: yvalue,
                    datasets: [
                        {
                        label: "Count Total",
                        data: xvalue,
                        backgroundColor: ["#FF5733", "#33FF57", "#5733FF", "#FF33A1", "#33A1FF", "#A1FF33", "#FF3333", "#33FFA1", "#A133FF", "#FFA133", "#33FF33", "#3333FF", "#FF33FF", "#33FFFF", "#FFFF33", "#FF6633", "#33FF66", "#6633FF", "#FF3366", "#3366FF"]
                        } //, 

                        // {
                        // label: "Injury Total",
                        // data: injuryValue
                        // }
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
        
        //Function optionChange, Change data & graph based on menu
        function optionChanged(value) {
            selectElement = document.querySelector("#statesFilter");
            output = selectElement.value;

            //Call functions on change
            deleteGraph();
            //Select state data
            stateSelector(output);
            //Organise the data for usage in stateGraph
            dataSelector(selectedStateData);
            //Plot the bar graph 
            stateGraph(deathData,categoryList, injuryData);
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
            //console.log(categoryList)

        // Get all the deaths for each category into an list
            deathData = [];
            for (let i = 0; i<selectedStateData.length;i++) {
                deathData.push(selectedStateData[i][1])
            };
            //console.log(deathData)

        // Check Injury list
            categoryInjuryList = []
            for (let i = 0; i<selectedInjuryData.length;i++) {
                categoryInjuryList.push(selectedStateData[i][0])
        };

            // console.log(categoryInjuryList);
        
        // Get all the injuries 
            injuryData = []
            for (let i = 0; i<selectedInjuryData.length;i++) {
                injuryData.push(selectedInjuryData[i][1])
            };

            //console.log(injuryData);

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

});

