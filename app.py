import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

#################################################
# Database Setup
#################################################
engine = create_engine("postgresql://sohailanazari07:bg1m9VKeRNvx@ep-sweet-meadow-71567163.us-east-2.aws.neon.tech/disasters?sslmode=require")

# Reflect an existing database into a new model
Base = automap_base()
# Reflect the tables
Base.prepare(autoload_with=engine)

# Save a reference to the table
disasterdata = Base.classes.disasters

#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available API routes."""
    return (
        "Available Routes:<br/>"
        "/api/v1.0/names<br/>"
    )

@app.route("/api/v1.0/names")
def names():
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

    # Convert the results to a list of dictionaries
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

if __name__ == '__main__':
    app.run(debug=True)
