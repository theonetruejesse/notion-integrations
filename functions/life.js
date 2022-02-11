const functions = require("firebase-functions");
const databaseId = functions.config().notion.databases.life_id;

const getLifeTable = async (notion, date) => {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: {
      and: [
        {
          property: "Date",
          date: {
            equals: formatDate(date),
          },
        },
      ],
    },
  });
  return results;
};

const getNewDateRange = (type, oldDateRange) => {
  const add = addDays(type);
  return {
    start: getNewDate(oldDateRange.start, add),
    end: getNewDate(oldDateRange.end, add),
    time_zone: oldDateRange.time_zone,
  };
};

const addDays = (type) => {
  let days;
  switch (type) {
    case "Once":
      days = 0;
      break;
    case "Daily":
      days = 1;
      break;
    case "EoD":
      days = 2;
      break;
    case "Biweekly":
      days = 3;
      break;
    case "Weekly":
      days = 7;
      break;
    case "EoW":
      days = 14;
      break;
    // technically off, but too lazy to change
    case "Monthly":
      days = 30;
      break;
    default:
      days = 0;
      break;
  }
  return days;
};

const getNewDate = (oldDate, add) => {
  if (!oldDate) {
    return oldDate;
  }
  const d = new Date(oldDate);
  d.setDate(d.getDate() + add);

  return formatDate(d);
};

// needed for Notion api filtering
const formatDate = (date) => {
  const formatedDate = new Date(date);
  return formatedDate.toISOString().split("T")[0];
};

// overengineered method for increasing counter without any edgecases lol; ex: 9) => 10)
const newFormatName = (name) => {
  const countArray = name.match(/^\d+[)]/);
  return countArray
    ? `${parseInt(countArray[0].split(")")[0]) + 1}) ${name
        .split(")")
        .slice(1)
        .join("")}`
    : `2) ${name}`;
};

// check streak, whether to increase or return to zero; if undefined, assume day 1
// v2 todo -> for multiple day type events, add additional logic, for now just stick with segmented
const newStreak = (count, isChecked) => {
  return 1 + (isChecked ? count || 1 : 0);
};

addToTable = async (notion, props, newDateRange, name) => {
  await notion.pages.create({
    parent: {
      database_id: databaseId,
    },
    properties: {
      ...props,
      Name: {
        title: [
          {
            text: { content: name },
          },
        ],
      },
      Date: {
        date: newDateRange,
      },
      Done: {
        checkbox: false,
      },
      Streak: {
        // current method joins them into 1 singular function, future method can just seperate these into 2 distinct functions
        number: newStreak(props.Streak.number, props.Done.checkbox),
      },
    },
  });
};

// needed for the multiple day structure
// todo, but for now, just go ez way out
const updateStreak = async (notion, pageId) => {};

// number of repeated blocks you want in Calendar
const maxRepeats = 1;

//main function
const dailyLife = async (notion) => {
  // sets + checks yesterday
  const y = new Date();
  y.setDate(y.getDate() - 1);

  const dailyTodos = await getLifeTable(notion, y);

  dailyTodos.map(async (dt) => {
    let dateRange = getNewDateRange(
      dt.properties.Repeat.select.name,
      dt.properties.Date.date
    );
    let repeat = 0;
    let nextName = newFormatName(dt.properties.Name.title[0].text.content);

    while (repeat < maxRepeats) {
      if (dt.properties.Repeat.select.name === "None") break;

      // this step can be optimized
      const newDayTodos = await getLifeTable(notion, new Date(dateRange.start));

      const hasDuplicates = newDayTodos.find(
        (nt) =>
          // to compare, today's name is equal to next time's name so you can reuse the function
          nextName === nt.properties.Name.title[0].text.content
      );

      if (!hasDuplicates) {
        addToTable(notion, dt.properties, dateRange, nextName);
        // updates the name again, to the next day
        nextName = newFormatName(nextName);
      } else if (repeat === maxRepeats - 1) {
        break;
      }

      // creates new date to check LifeTable with
      dateRange = getNewDateRange(dt.properties.Repeat.select.name, dateRange);

      repeat++;
    }
  });
};

module.exports = dailyLife;
