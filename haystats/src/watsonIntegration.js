import NaturalLanguageUnderstandingV1 from 'ibm-watson/natural-language-understanding/v1';
import { IamAuthenticator } from 'ibm-watson/auth';

function watson(URL, setSummary){
  // const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
  // const { IamAuthenticator } = require('ibm-watson/auth');

  const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
    version: '2020-08-01',
    authenticator: new IamAuthenticator({
      apikey: '6dpL4JnV-ztfp_b5GooKwi7xvCxsR3VgfEQz7x-8VDfl',
    }),
    serviceUrl: 'https://api.us-east.natural-language-understanding.watson.cloud.ibm.com/instances/55fdcf04-ebf3-405c-81b3-28c5e797f1c1',
  });

  //consts
  const MAX_CATEGORY = 1;
  const MAX_CONCEPTS = 3;
  const MAX_KEYWORDS = 50;
  const MAX_ENTITIES = 50;

  const KEYWORD_REL_THRESHOLD = 0.7;
  const ENTITY_REL_THRESHOLD = 0.3;

  //`${URL}`
  //take out categories, concepts, entity
  const analyzeParams = {
    'url': `${URL}`,
    'returnAnalyzedText': true,
    'features': {
        'metadata' : {},
      'categories' : {
          'limit' : MAX_CATEGORY
      },
      'concepts': {
        'limit': MAX_CONCEPTS
      },
      'keywords' : {
          'limit' : MAX_KEYWORDS
      },
      'entities' : {
          //'mentions' : true,
          'limit' : MAX_ENTITIES
      }
    }
  };

  naturalLanguageUnderstanding.analyze(analyzeParams)
    .then(analysisResults => {
      //console.log(JSON.stringify(analysisResults, null, 2));
      
    var title = analysisResults["result"]["metadata"]["title"];
    
    var article_text = analysisResults["result"]["analyzed_text"];

    var categories = [];
    for(let item = 0; item < analysisResults["result"]["categories"].length; item++){
      categories[item] = analysisResults["result"]["categories"][item]["text"];
    }

    var concepts = [];
    for(let item = 0; item < analysisResults["result"]["concepts"].length; item++){
      concepts[item] = analysisResults["result"]["concepts"][item]["text"];
    }

    var keywords = [];
    for(let item = 0; item < analysisResults["result"]["keywords"].length; item++){
      if(analysisResults["result"]["keywords"][item]["relevance"] > KEYWORD_REL_THRESHOLD){
        keywords.push(analysisResults["result"]["entities"][item]["text"]);
      }
    }

    var quantities = [];
    var entities = [];
    for(let item = 0; item < analysisResults["result"]["entities"].length; item++){
      if((analysisResults["result"]["entities"][item]["type"] === "Quantity") && (analysisResults["result"]["entities"][item]["relevance"] > ENTITY_REL_THRESHOLD)){
        quantities.push(analysisResults["result"]["entities"][item]["text"]);
      }
      else if (analysisResults["result"]["entities"][item]["relevance"] > ENTITY_REL_THRESHOLD){
        entities.push(analysisResults["result"]["entities"][item]["text"]);
      }
    }

    //add sentences
    let sentences = article_text.match(/([^\.!\?]+[\.!\?]+)|([^\.!\?]+$)/g);
    let statistics = [];


    let information;
    
    information += "TITLE:\n" + title + "\n";

    let titleList = [];
    
    let titleInfo = {
      "title": "TITLE",
      "info": titleList,
    }

    information["info"].push(title);
    information.push(titleInfo);

    let conceptList = [];

    /*let conceptInfo = {
      "title": "CONCEPTS",
      "info": conceptList,
    }*/
    
    for(let concept = 0; concept < concepts.length; concept++){
        conceptList.push(concepts[concept]);
    }

    information.push(conceptInfo);
    /*
    for (let quantity = 0; quantity < quantities.length; quantity++)
      {
        if ( sentences[sentence].includes(quantities[quantity]) )
        {
          console.log(sentences[sentence]);
          //document.write (sentences[sentence]);
          quantity = quantities.length;
        }
      }
  
      */


    let dataList = [];
/*
    let dataInfo = {
      "title": "DATA",
      "info": dataList,
    }
*/

    for (let sentence = 0; sentence < sentences.length; sentence++)
    {
      for (let quantity = 0; quantity < quantities.length; quantity++)
      {
        if ( sentences[sentence].includes(quantities[quantity]) )
        {
          dataList["info"].push(sentences[sentence]);
          //document.write (sentences[sentence]);
          quantity = quantities.length;
        }
      }
    }
          
    let exportingInfo = {
      "title": `TITLE ${title}`,
        sections: [
        {
          "sectionTitle": "CONCEPTS",
          information: conceptList
        },

        {
          sectionTitle: "DATA",
          information: dataList
        }
      ]
    }
    
    //information.push(dataList);
    
    setSummary(exportingInfo);
    //console.log(information);

     /*
    console.log("\nARTICLE: ");
    console.log(article_text);
    */

    //setSummary(information);
    //console.log(information);
      //info = JSON.stringify(analysisResults.keywords, null, 2);
      //console.log(info);
    })
    .catch(err => {
      console.log('error:', err);
    });

  //let list = article_text.split(". ");
}

export default watson;
