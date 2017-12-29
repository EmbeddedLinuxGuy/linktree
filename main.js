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
select from_visit, place_id from moz_historyvisits
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

// return: length of referrer chain. 0 for no referrers.
var chain_length = function(place_id, from_visit) {
//    console.log(`Chain length for ${place_id} is: ???`);
    connection.query(get_parent_query, [ from_visit ], function (e, r, f) {
	if (e) throw e;
	//	console.log(r[0].from_visit);
	//	console.log(r.length);
	if (r.length === 1) {
//	    console.log("Good entry");
//	    extend_chain();
	} else if (r.length === 0) {
	    //	    console.log("Empty entry");
//	    return 0;
	} else {
	    console.log(r.length);
	}
	if (--con_count === 0) {
	    connection.end();
	}
    });
}

var con_count = 0;
connection.query(get_all_visits_query, function (e, r, f) {
    if (e) throw e;
    con_count = r.length;
    for (i=0; i < r.length; ++i) {
//	console.log(`${r[i].place_id}, ${r[i].from_visit}`);
	chain_length(r[i].place_id, r[i].from_visit);
    }
});

// xxx - after last query, end connection and exit
//connection.end();
