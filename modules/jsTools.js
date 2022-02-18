module.exports = {
    CleanStringArrayWhitespace: CleanStringArrayWhitespace,
    RandomChance: RandomChance,
    RandomChoice: RandomChoice,
    RandomNumber: RandomNumber
}

// >> Custom Functions
// Removes leading whitespace caused by spaces after seperators
function CleanStringArrayWhitespace(arr) {
    let newArr = [];

    arr.forEach(item => {
        if (typeof item === "string") {
            let removIndex = 0;

            for (let char of item) { if (char === " ") removIndex++; else break; }
            if (removIndex > 0) item = item.slice(removIndex);
        }

        newArr.push(item);
    });

    return newArr;
}

function RandomChance(p) {
    return Math.floor(Math.random() * p) === 1;
}

function RandomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function RandomNumber(max, floor = true) {
    if (floor)
        return Math.floor(Math.random() * max);
    else
        return Math.random() * max;
}