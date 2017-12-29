#!/usr/bin/env node

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
//  password : 'secret',
  database : 'webtrace'
});

connection.connect();

var query = `
select (select title from moz_places
                   where id=(select i.place_id from moz_historyvisits i
                                               where i.id=h.from_visit))
               AS parent_page,
       (select title from moz_places where id=h.place_id) as child_page
       from moz_historyvisits h`;
//       where h.from_visit !=0 and h.place_id !=0 `;


// return all visits from moz_historyvisits
var get_all_visits_query = `
select id from moz_historyvisits
`;

// for a given visit, return referring page's visit id
var get_parent_query = `
select from_visit, place_id
       from moz_historyvisits
       where id=?
`;

var red = "\033[31m";
var green = "\033[32m";
var yellow = "\033[33m";

var extend_chain = function(from_visit) {
    connection.query(get_parent_query, [ from_visit ], function (e, r, f) {
    });
};

// place_id: place visited; index to moz_places
// from_visit: referrer; index to moz_historyvisits

function get_next_id(the_id, results=[]) {
    return new Promise(function (resolve, reject) {
	connection.query(get_parent_query, [the_id], function (e, r, f) {
	    if (e) { reject([e, results]); return; }
	    resolve(r);
	});
    }).then(function(r) {
	if (r.length === 0) {
//	    console.log("WARNING: missing table entry");
	    return results;
	}
	if(r[0].from_visit === 0) {
//	    console.log("Done");
	    return results;
	}
	//recusively call unless id is 0
	return get_next_id(r[0].from_visit, results.concat(r));
    });
}


var longest = [];

connection.query(get_all_visits_query, function (e, r, f) {
    if (e) throw e;
    con_count = r.length;
    let promises = [];
    for (i=0; i < r.length; ++i) {
	promises.push(get_next_id(r[i].id).then(function(r) {
	    if (r.length > longest.length) {
		longest = r;
		console.log("Longest: " + longest.length);
	    }
	}));
    }
    Promise.all(promises).then(function() {
	console.log("ALL Done");
	console.log("Longest: " + JSON.stringify(longest));
	connection.end();
    });
});
