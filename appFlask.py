import sqlalchemy
from sqlalchemy import create_engine, func
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from flask import Flask, render_template, url_for, jsonify
from collections import OrderedDict
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


#################################################
# Database Setup
#################################################

# Engine creation 
engine = create_engine("postgresql://sohailanazari07:bg1m9VKeRNvx@ep-sweet-meadow-71567163.us-east-2.aws.neon.tech/disasters?options=endpoint%3Dep-sweet-meadow-71567163")

# Reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(autoload_with=engine)

# Save reference to the table

disasterdata = Base.classes.disasters

#################################################
# Flask Routes 
#################################################
@app.route("/")
def welcome():
    """List all available API routes."""

    return (
        "Available Routes:<br/>"
        "/api/v1.0/get_data<br/>"
    )
#######################
##### HTML Routes #####
#######################

@app.route('/piechart')
def piechart():
    return render_template('PieChart.html')

@app.route("/barchart")
def barchart():  

    return render_template("BarChart.html")

@app.route("/linechart")
def linechart():

    return render_template("LineChart.html")


####################
##### Get Data #####
####################

@app.route("/get_data")
def dataset():

    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all column data available"""
    # Query all data
    results = session.query(
        disasterdata.id, disasterdata.category, disasterdata.sub_category, disasterdata.description,
        disasterdata.startdate, disasterdata.enddate, disasterdata.latitude, disasterdata.logitude,
        disasterdata.injuries, disasterdata.deaths, disasterdata.regions
    ).all()

    session.close()


    # Create a list to hold all the inputs
    finalresults = []
    for row in results:
        dataresults = {
            "id": row[0],
            "category": row[1],
            "sub_category": row[2],
            "description": row[3],
            "startdate": row[4],
            "enddate": row[5],
            "latitude": row[6],
            "logitude": row[7],
            "injuries": row[8],
            "deaths": row[9],
            "regions": row[10]
        }
        finalresults.append(dataresults)

    # Return JSON response using jsonify
    return jsonify({"results": finalresults})

################################
##### Get Transformed Data #####
################################

@app.route("/get_transformed_data")
def transformeddataset():
    session = Session(engine)
    results = session.query( disasterdata.category, disasterdata.injuries, disasterdata.deaths, disasterdata.regions).all()
    session.close()
   
    finalresults = []
    for a,b,c,d in results:
        dataresults = OrderedDict()
        dataresults["category"] = a
        dataresults["injuries"] = b
        dataresults["deaths"] = c
        dataresults["regions"] = d
        finalresults.append(dataresults)
        
    return {"results": finalresults} 


if __name__ == '__main__':
    app.run(debug=True)