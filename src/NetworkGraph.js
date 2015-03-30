var NetworkGraph = (function() {
    "use strict";
    var timerhandle;
    var log = function(msg) {
            if (enableLog && window.console) {
                window.console.log(msg);
            }
        },
        enableLog = false;

    var showInfo = function(relation) {
        log(relation);
        $('text:contains("' + relation.source.name + '")').css('font-weight', 'bold');
        $('text:contains("' + relation.target.name + '")').css('font-weight', 'bold');
        var link = $(this);
        log(link);
        $(".infobox").css("top", link.position().top + 40);
        $(".infobox").css("left", link.position().left + 40);
        $(".infobox").fadeIn();
        $(".infobox .header").text(relation.source.name);

        $(".infobox .info").text((relation.active === 0 ? "Former " : "") + relation.role + " in " + relation.target.name);
    };

    var linkMouseOut = function(relation) {
        $("text:contains('" + relation.source.name + "')").css("font-weight", "normal");
        $("text:contains('" + relation.target.name + "')").css("font-weight", "normal");

        clearTimeout(timerhandle);
        timerhandle = setTimeout(function() {
            $(".infobox").fadeOut();

        }, 12000);
    };


    var start = function(_width, _height, _spreadsheetId, weightFilter) {
        var minNodeWeight = weightFilter || 1;
        $(".infobox").mouseover(function() {
            log("mouseover infobox");
            $(".infobox").css("top", $(".infobox").position().top + 50);
        });
        DataLoader.load(_spreadsheetId, function(links) {
            if (links.toArray)
                links = links.toArray();
            log('spreadsheet data:');
            //log(JSON.stringify(links));
            // Compute the distinct nodes from the links.

            var nodes = {},
                orgnames = [],
                personnames = [],
                linkCount = {},
                filteredLinks = [];

            links.forEach(function(link) {
                link.source = link.source.trim();
                link.target = link.target.trim();
                personnames.push(link.source + "");
                orgnames.push(link.target + "");
                var srcString = link.source + "";

                // counting node weight
                linkCount[srcString] = linkCount[srcString] ? linkCount[srcString] + 1 : 1;

                link.source = nodes[link.source] || (nodes[link.source] = {
                    name: link.source,
                    nodetype: "person"
                });
                link.target = nodes[link.target] || (nodes[link.target] = {
                    name: link.target,
                    nodetype: "org",
                    orgtype: link.orgtype
                });
            });

            // links will now filter out relations to nodes with a weight (number of connections) lower than [minNodeWeight]
            links.forEach(function(link) {
                // person is org
                if (orgnames.indexOf(link.source.name) > -1) {
                    filteredLinks.push(link);
                } else {
                    if (linkCount[link.source.name] < minNodeWeight && link.source.nodetype === 'person') {} else {
                        filteredLinks.push(link);
                    }
                }
            });

            // nodes with fewer than [minNodeWeight] relations will be deleted
            for (var person in linkCount) {
                if (orgnames.indexOf(person) > -1) {} else {
                    if (linkCount[person] < minNodeWeight) {
                        delete nodes[person];
                    }
                }
            }

            log(JSON.stringify(filteredLinks[0]));
            log(JSON.stringify(nodes));
            filteredLinks.forEach(function(item) {
                if (nodes[item.source.name]) {} else {
                    log(item.source.name + " NOT IN NODES LIST");
                }
                if (!nodes[item.target.name]) {
                    log(item.target.name + " NOT IN NODES LIST");
                }
            });


            var width = _width || 960,
                height = _height || 500;

            var force = d3.layout.force();

            var drag = force.drag()
                .on("dragstart", dragstart);

            var d3nodes = d3.values(nodes);
            force.nodes(d3nodes).links(filteredLinks);

            var nodes = force.nodes(),
                filteredLinks = force.links();

            var svg = d3.select("body")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            function update() {
                var link = svg.selectAll(".link")
                    .data(filteredLinks);
                link.enter().append("line")
                    .attr("class", function(d) {
                        return d.active === "1" ? "link active" : "link inactive";
                    })
                    .on("mouseover", showInfo)
                    .on("mouseout", linkMouseOut);

                link.exit().remove();

                var node = svg.selectAll(".node")
                    .data(nodes);

                var nodeEnter = node.enter().append("g")
                    .attr("class", function(d) {
                        return "node " + d.nodetype + " " + d.orgtype;
                    })
                    .on("dblclick", dblclick)
                    .call(force.drag);

                nodeEnter.append("circle")
                    .attr("r", 6);


                // adding label
                nodeEnter.append("text")
                    .attr("x", 12)
                    .attr("dy", ".35em")
                    .text(function(d) {
                        return d.name;
                    }).on("mouseover", function() {});

                node.exit().remove();

                log('STARTING');

                force.on("tick", function() {
                    link
                        .attr("x1", function(d) {
                            return d.source.x;
                        })
                        .attr("y1", function(d) {
                            return d.source.y;
                        })
                        .attr("x2", function(d) {
                            return d.target.x;
                        })
                        .attr("y2", function(d) {
                            return d.target.y;
                        });

                    node
                        .attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                })
                force
                    .size([width, height])
                    .linkDistance(90)
                    .charge(function(n, i) {
                        return n.nodetype === "person" ? -300 : -300;
                    })
                    .linkStrength(1)
                    .start();
            }

            update();

            function dragstart(d) {
                d3.select(this).classed("fixed", d.fixed = true);
            }

            function dblclick(d) {
                d3.select(this).classed("fixed", d.fixed = false);
            }
        });
    };
    return {
        start: start
    };
})();