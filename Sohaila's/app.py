from flask import Flask, render_template
from sqlalchemy import create_engine
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from collections import OrderedDict

#################################################
# Database Setup
#################################################

engine = create_engine("postgresql://sohailanazari07:bg1m9VKeRNvx@ep-sweet-meadow-71567163.us-east-2.aws.neon.tech/disasters?options=endpoint%3Dep-sweet-meadow-71567163")

Base = automap_base()
Base.prepare(autoload_with=engine)

print(Base.classes.keys())
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
    return render_template("index.html")

@app.route("/get_data")
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
        dataresults = OrderedDict()
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

