const url = "http://127.0.0.1:5000/api/v1.0/names";

d3.json(url).then(d => {
    console.log(d.result);
});