import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify


#################################################
# Database Setup
#################################################
engine = create_engine("postgresql://sohailanazari07:bg1m9VKeRNvx@ep-sweet-meadow-71567163.us-east-2.aws.neon.tech/disasters?sslmode=require")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(autoload_with=engine)

print(Base.classes.keys())
# Save reference to the table
disasterdata = Base.classes.disasters

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"/api/v1.0/names<br/>"
    )


@app.route("/api/v1.0/names")
def names():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all column data available"""
    # Query all passengers
    results = session.query(disasterdata.id, disasterdata.category, disasterdata.sub_category, disasterdata.description, disasterdata.startdate,
                             disasterdata.enddate, disasterdata.latitude,disasterdata.logitude, disasterdata.injuries, disasterdata.deaths, disasterdata.regions).all()
    
    
    print(results)
    session.close()

    
    finalresults = []
    for i,j,k,l,m,n,o,p,q,r,s in results:
        dataresults = {}
        dataresults["id"] = i 
        dataresults["category"] = j 
        dataresults["sub_category"] = k 
        dataresults["description"] = l
        dataresults["startdate"] = m
        dataresults["enddate"] = n
        dataresults["latitude"] = o
        dataresults["logitude"] = p
        dataresults["injuries"] = q
        dataresults["deaths"] = r
        dataresults["regions"] = s
        finalresults.append(dataresults)
        return {"results": finalresults} 
    

if __name__ == '__main__':
    app.run(debug=True)
