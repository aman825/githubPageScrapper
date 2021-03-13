const request = require("request");
const cheerio = require("cheerio");
let fs = require("fs");
let $;
let data = {};

function linkGenerator(error, response, body) {
  if (!error && response.statusCode == 200) {
    $ = cheerio.load(body);

    let alltopics = $(".no-underline.d-flex.flex-column.flex-justify-center");
    let allTopicNames = $(
      ".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1"
    );
    for (let x = 0; x < 3; x++) {
      getTopicPage(
        $(allTopicNames[x]).text().trim(),
        "https://github.com/" + $(alltopics[x]).attr("href")
      );
    }
  }
}

function getTopicPage(name, url) {
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      $ = cheerio.load(body);
      let allProjects = $(
        ".f3.color-text-secondary.text-normal.lh-condensed .text-bold"
      );

      if (allProjects.length > 8) {
        allProjects = allProjects.slice(0, 8);
      }

      for (let x = 0; x < allProjects.length; x++) {
        let projectTitle = $(allProjects[x]).text().trim();
        let projectLink =
          "https://github.com/" + $(allProjects[x]).attr("href");
        if (!data[name]) {
          data[name] = [{ name: projectTitle, link: projectLink }];
        } else {
          data[name].push({ name: projectTitle, link: projectLink });
        }
        //getIssuePage
        getIssuesPage(projectTitle, name, projectLink + "/issues");
      }
    }
  });
}



function getIssuesPage(projectName, topicName, url) {
  request(url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      $ = cheerio.load(body);

      let allIssues = $(
        ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open"
      );

      for (let x = 0; x < allIssues.length; x++) {
        let issueURL = "https://github.com/" + $(allIssues[x]).attr("href");
        let issueTitle = $(allIssues[x]).text().trim();

        let index = -1;
        for (let i = 0; i < data[topicName].length; i++) {
          if (data[topicName][i].name === projectName) {
            index = i;
            break;
          }
        }

        if (!data[topicName][index].issues) {
          data[topicName][index].issues = [{ issueTitle, issueURL }];
        } else {
          data[topicName][index].issues.push({ issueTitle, issueURL });
        }
      }
      fs.writeFileSync("data.json", JSON.stringify(data));
    }
  });

  //multiple times
}

request("https://github.com/topics", linkGenerator);
