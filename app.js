const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

mongoose.connect("mongodb+srv://fakeuser:fakepwd@cluster0.ci0mfqj.mongodb.net/todoList");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "This is a great day to get some to do's done!"
});

const item2 = new Item({
    name: "Press + to add new items"
});

const item3 = new Item({
    name: "<= checkbox to mark complete!"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




    app.get("/", async function (req, res) {
        try 
        {
            const foundItems = await Item.find({});
            if (foundItems.length === 0) 
            {
                //callbacks no longer supported which is why I went with async functions because async lets me do a callback a different way
                Item.insertMany(defaultItems)
                    .then(() => 
                    {
                        console.log("Success");
                        res.redirect("/");
                    })
                .catch((err) => 
                {
                    console.log(err);
                });
            } else 
                {
                res.render("list", { listTitle: "Today", newListItems: foundItems });
                }
        } catch (err) {
            console.log(err);
        }
    });


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); 

app.use(express.static("public"));
// just a regular function done a little different than hers using a lot of then and catch calls. 
app.post("/", function (req, res) 
{
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if (listName === "Today"){
        try {
        item.save();
        res.redirect("/");
    } catch (err) {
        console.log(err);
    
    }
    } else {
        List.findOne({ name: listName })
        .then(foundList => {
            if (foundList) {
                foundList.items.push(item);
                foundList.save()
                .then(() => {
                    res.redirect("/" + listName);
                })
                .catch(err => {
                    console.log(err);
                });
            }
        })
        .catch(err => {
            console.log(err);
        });
    }
});
//went with another async function which is why we have await
app.post("/delete", async function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        try {
            await Item.findByIdAndDelete(checkedItemId);
            console.log("Deleted");
            res.redirect("/");
        } catch (err) {
            console.log(err);
            res.redirect("/");
        }
    } else {
        try {
            await List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } });
            res.redirect("/" + listName);
        } catch (err) {
            console.log(err);
            res.redirect("/" + listName);
        }
    }
});


 
app.get("/:customListName", async function(req,res) 
{
    const customListName = req.params.customListName;
    try 
    {
        const foundList = await List.findOne({ name: customListName });

        if (!foundList) 
            {
            const list = new List(
                {
                name: customListName,
                items: defaultItems
            });

            await list.save();
            res.redirect("/" + customListName);
            } else 
            {
            res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
    } catch (err) 
    {
        console.log(err);
    }
});

app.get("/about", function (req, res) 
{
    res.render("about");
})
app.post("./work", function (req, res) 
{
    let item = req.body.newItem
    workItems.push(item);
    res.redirect("/work");
})

app.listen(3000, function () 
{
    console.log("Server started");
});


app.use(express.static("public"));