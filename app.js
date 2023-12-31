const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const Problem = require("./models/problem")
const path = require("path");
const url = require("url");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));
app.use("/public",express.static("public"));
app.use(express.json()); 

// Database Connection Set Up, Will Only Listen After DB Conection Has Occured.
var port = process.env.PORT || 3000;

mongoose.connect("a database connection is made here", {useNewUrlParser: true})
    .then((result) => app.listen(port))
    .catch((err) => console.log(err));

var sideBarDictionary = new Map();
var problemDetails = new Problem;
var problemArray = [];
var currentProblem = new Problem;
var myRes = null;

app.get('/', (req, res) => {
    res.redirect(("http://www.valueati.com/problem/62f1d7ea62626f410b8d4808"))
});

app.get('/problem/:id', (req, res) => {
    const id = req.params.id;
    myRes = res;
    var sideBarDictionar = new Map();
        Problem.find()
        .then(result => {
            // Convert Problem JSON Array To Problem Object Array 
            problemObjectArray = [];
            result.forEach(problemJSON => {
                problemObject = new Problem(problemJSON);
                problemObjectArray.push(problemObject);
            });
            problemArray = problemObjectArray;
            // Convert Problem Object Array To Sidebar Dictionary
            sideBarDictionary = convertProblemArrayToSideBarDictionary(problemArray);
        })         
        .catch(err => {
            console.log(err);
        });
        reloadPageWithProblemID(id);
});

app.get('/problem/lastPage/:id', (req, res) => {
    const currentProblemId = req.params.id;
    Problem
        .findById(currentProblemId)
        .then(idProblem => {
            Problem
                .count()
                .then(numberOfItems => {
                    let nextProblemNumber = idProblem.problemNumber - 1;
                    if (nextProblemNumber == 0 || currentProblemId == "62f1d7ea62626f410b8d4808#/") {
                        nextProblemNumber = numberOfItems;
                    }
                    Problem
                        .findOne( { "problemNumber": { $eq: nextProblemNumber }} )
                        .then(nextProblem => {
                            let nextProblemId = nextProblem._id
                            res.redirect("http://www.valueati.com/problem/" + nextProblemId);
                            //res.redirect(("http://localhost:3000/problem/" + nextProblemId))
                        }); 
                });        
        });
});

app.get('/problem/nextPage/:id', (req, res) => {
    const currentProblemId = req.params.id;
    Problem
        .findById(currentProblemId)
        .then(idProblem => {
            Problem
                .count()
                .then(numberOfItems => {
                    let nextProblemNumber = idProblem.problemNumber + 1;
                    if (nextProblemNumber > numberOfItems) {
                        nextProblemNumber = 1;
                    }
                    Problem
                        .findOne( { "problemNumber": { $eq: nextProblemNumber }} )
                        .then(nextProblem => {
                            let nextProblemId = nextProblem._id
                            res.redirect("http://www.valueati.com/problem/" + nextProblemId);
                            //res.redirect(("http://localhost:3000/problem/" + nextProblemId))
                        }); 
                });        
        });
});

function reloadPageWithProblemID(id) {
    Problem.findById(id)
        .then(idProblem => { 
            currentProblem = idProblem;
            problemDetails = idProblem.solution;
            myRes.render("problem", { sideBarDictionary: sideBarDictionary, problemDetails: problemDetails });
    })
}

// Create Dictionary For Category Buttons
function convertProblemArrayToSideBarDictionary(problemArray) {
    var sideBarDictionary = new Map();
    problemArray.forEach(problem => {
        problem.category.forEach(individualCategory => {
            if (sideBarDictionary.has(individualCategory)) {
                const tempValueArray = sideBarDictionary.get(individualCategory);
                tempValueArray.push(problem);
                sideBarDictionary.set(individualCategory, tempValueArray);
            } else {
                const problemArrayValue = [];
                problemArrayValue.push(problem);
                sideBarDictionary.set(individualCategory, problemArrayValue);
            };
        });
    });
    return sideBarDictionary;
};
