// @license Material Calendar (v. 0.0.1.0 beta)

(function() {
	'use stric';
	var perf_start = performance.now();
	var consoleDebug = false;

	this.MaterialCalendar = function() {
		this.calendar = null;
		this.messages = {
			all: "todos"
		};

		// default options
		var defaults = {
			consoleDebug: false,
			language: "pt-BR",
			className: "full",
			container: "body",
			eventDateFormat: "dd/MM/yyyy"
		};

		// personal options
		if (arguments[0] && typeof arguments[0] === "object") {
			this.options = getConfiguration(defaults, arguments[0]);
		} else {
			this.options = defaults;
		}

		// update range with date format options
		this.options.range = updateRange(this.options.range);
		this.options.eventDateFormat = this.options.eventDateFormat.toLowerCase();
		consoleDebug = this.options.consoleDebug;

		this.createCalendar();
	};

	MaterialCalendar.prototype.createCalendar = function() {
		build.call(this);
		var perf_end = performance.now();
		if (consoleDebug) console.log("build calendar took " + (perf_end - perf_start) + " milliseconds.");

		if (this.options.events !== undefined) {
			perf_start = performance.now();
			markEvents(this.options, this.options.events);
			perf_end = performance.now();
			if (consoleDebug) console.log("build calendar events took " + (perf_end - perf_start) + " milliseconds.");
		}
	};

	MaterialCalendar.prototype.addEvents = function(opt) {
		// default options
		var defaults = {
			linkTarget: "_blank"
		};

		// ajax options
		opt = getConfiguration(defaults, opt);

		var http_req,
				calendar = this,
				loading, loading_child, loading_width,
				data = "";

		perf_start = performance.now();

		http_req = new XMLHttpRequest();

		// create loading
		loading = document.createElement("div");
		loading.id = "material-calendar-loading";

		loading_child = document.createElement("div");
		loading_child.className = "material-calendar-progress";

		try {
			if (opt.beforeSend) opt.beforeSend();

			if (opt.data !== undefined) {
				for (var key in opt.data) {
					data += key + '=' + opt.data[key] + '&';
				}

				data = data.slice(0, data.length - 1);

				opt.url = opt.url + "?" + data;
			}

			http_req.open('GET', opt.url);
			http_req.send();

			loading_child.style.width = "25%";

			loading.appendChild(loading_child);
			document.querySelector(".material-calendar-header").appendChild(loading);

			http_req.onreadystatechange = function() {
				loading_width = Number.parseInt(document.querySelector(".material-calendar-progress").style.width);
				loading_width += 25;

				document.querySelector(".material-calendar-progress").style.width = loading_width + "%";

				if (http_req.readyState === 4) {
					markEvents(calendar.options, opt, JSON.parse(http_req.responseText));
					document.querySelector("#material-calendar-loading").remove();

					if (opt.success) opt.success();
				}
			};

			http_req.onerror = function(err) {
				loading = document.querySelector(".material-calendar-progress");
				loading.style.width = "100%";
				loading.className = "material-calendar-progress error";
				if (opt.error) opt.error();
			};
		}
		catch (err) {
			if (consoleDebug) throw new Error("XMLHttpRequest.open() failed.\n" + err);
		}

		perf_end = performance.now();
		if (consoleDebug) console.log("add events took " + (perf_end - perf_start) + " milliseconds.");
	};

	MaterialCalendar.prototype.destroy = function() {
		this.calendar.remove();
	};

	// build
	function build() {
		var opt = this.options,
				msg = this.messages,
				hasGroups = opt.groups !== undefined,
				header, header_title, body, table, thead, tbody, tr, tr_child, link, icon,
				tbody_month = [], week_list = [], week_table, day_table, month_child, week_child, day_child, months, month, weeks, week,
				rows, temporary, helper, count;

    // calendar container
    this.calendar = document.createElement("section");
  	this.calendar.className = "material-calendar-container " + opt.className;

  	// calendar header
  	header = document.createElement("header");
  	header.className = "material-calendar-header";
  	header_title = document.createElement("h2");
  	header_title.insertAdjacentHTML("beforeend", getTitle(opt.range, opt.language));
  	header.appendChild(header_title);
  	this.calendar.appendChild(header);

  	// calendar body
		body = document.createElement("section");
		body.className = "material-calendar-body";

		// table
		table = document.createElement("table");
		table.className = "calendar-table";

		// table thead
		thead = document.createElement("thead");
		tr = document.createElement("tr");

		// table body
		tbody = document.createElement("tbody");
		tr = document.createElement("tr");

		// if calendar has groups in options
		// append a dropdown for all groups
		if (hasGroups) {
			getGroupTitle(thead, link, icon, tr, msg.all);

			temporary = document.createElement("tr");
			tr_child = document.createElement("th");
			tr_child.className = "team";
			temporary.appendChild(tr_child);
		}

		thead.appendChild(tr);
		tbody.appendChild(temporary || tr);

		// get months from options range and create the header
		// with the months and weeks
		months = getMonths(opt.range.start, opt.range.end, opt.language);

		for (month in months.formated) {
			// creates a th child for each month
			tr_child = document.createElement("th");
			tr_child.className = "month";
			tr_child.insertAdjacentHTML("beforeend", months.formated[month]);

			// append th child in thead
			tr = thead.querySelector("tr");
			tr.appendChild(tr_child);

			// append th child in tbody
			tr_child = document.createElement("td");
			tr_child.className = "month";
			tr = tbody.lastElementChild;
			tr.appendChild(tr_child);

			// create a table for weeks
			weeks = document.createElement("table");
			weeks.className = "weeks";
			temporary = document.createElement("thead");
			weeks.appendChild(temporary);
			tr_child.appendChild(weeks);

			// create a tr for the week
			temporary = document.createElement("tr");
			helper = months.normal[month].split("/");

			// get all weeks
			weeks = getWeeks(helper[0], helper[1], opt.language, opt.eventDateFormat, week_list);

			month_child = document.createElement("td");
			month_child.className = "month";

			// create a table for weeks in each month
			week_table = document.createElement("table");
			week_table.className = "weeks";
			month_child.appendChild(week_table);

			week_child = document.createElement("tr");
			month_child.querySelector(".weeks").appendChild(week_child);

			for (week in weeks) {
				// create an td child for each week
				helper = document.createElement("td");
				helper.insertAdjacentHTML("beforeend", weeks[week]);
				temporary.appendChild(helper);

				// create an td child for each week
				week_child = document.createElement("td");
				week_child.className = "week";
				week_child.setAttribute("data-week", weeks[week]);

				// create a table for days
				day_table = document.createElement("table");
				day_table.className = "days";
				helper = document.createElement("tbody");
				day_table.appendChild(helper);

				helper = weeks[week].split("/");

				for (count = 0; count < 7; count++) {
					day_child = document.createElement("td");
					day_child.className = "day";
					day_child.setAttribute("data-day", convertDate(new Date(2015, (Number(helper[1]) - 1), (Number(helper[0]) + count)), opt.language));
					day_table.querySelector("tbody").appendChild(day_child);
				}

				week_child.appendChild(day_table);
				month_child.querySelector("tr").appendChild(week_child);
			}

			tbody_month.push(month_child);
			tr_child.querySelector(".weeks thead").appendChild(temporary);
		}

		// append a row for each group in options or just one for the main content
		rows = hasGroups ? opt.groups.length : 1;
		for (var i = 0; i < rows; i++) {
			tr = document.createElement("tr");
			tbody.appendChild(tr);

			// if has group append a th child with the group title
			if (hasGroups) {
				getGroupTitle(tr_child, link, icon, tr, opt.groups[i]);
				tr.setAttribute("data-group", removeSpecialChars(opt.groups[i]));
			}

			for (count = 0; count < tbody_month.length; count++) {
				tr_child = tbody_month[count].cloneNode(true);
				tr.appendChild(tr_child);
			}
		}

		table.appendChild(thead);
		table.appendChild(tbody);

		// append table to body
		body.appendChild(table);
		this.calendar.appendChild(body);

  	// append doc to container set in configuration
  	document.querySelector(opt.container).appendChild(this.calendar);
	}

	// add events
	function markEvents(calendar_opt, events_opt, events) {
		var row, actual_element, event_container, event_child, subevent_container, subevent_child, start;

		events = convertEventsDate(events, calendar_opt.eventDateFormat);
		events = events.sort(sortJsonByStartDate);

		for (var e in events) {
			if (events[e].start < calendar_opt.range.start) {
				events[e].start = new Date(calendar_opt.range.start);
			}

			if (events[e].end > calendar_opt.range.end) {
				events[e].end = new Date(calendar_opt.range.end);
			}

			start = convertDate(events[e].start, calendar_opt.language);
			events[e].end = convertDate(events[e].end, calendar_opt.language);

			row = document.querySelector('[data-group="' + removeSpecialChars(events[e].group) + '"]');
			actual_element = row.querySelector('[data-day="' + start + '"]');

			console.log(actual_element.offsetHeight);

			// creates the event container
			event_container = document.createElement("section");
			event_container.className = "material-calendar-event";
			calcEventPositionAndWidth(event_container, start, row, events[e].end, events[e].start, calendar_opt.language, calendar_opt.eventDateFormat);

			// creates the event title
			event_child = document.createElement("h3");
			event_child.className = "material-calendar-title";
			event_child.setAttribute("data-title", events[e].title);
			event_child.insertAdjacentHTML("beforeend", events[e].resume === undefined ? events[e].title : events[e].resume);

			// append title to event
			event_container.appendChild(event_child);
			actual_element.appendChild(event_container);

			// if has subevents append them o event
			if (events[e].subevents !== null) {
				for (var s in events[e].subevents) {
					subevent_container = document.createElement("article");
					subevent_container.className = "material-calendar-card";

					if (events[e].subevents[s].link !== null) {
						subevent_child = document.createElement("a");
						subevent_child.className = "material-calendar-title";
						subevent_child.setAttribute("href", events[e].subevents[s].link);
						subevent_child.setAttribute("target", events_opt.linkTarget);
						subevent_child.insertAdjacentHTML("beforeend", events[e].subevents[s].description);

						subevent_container.appendChild(subevent_child);
					} else {
						subevent_child = document.createElement("h5");
						subevent_child.className = "material-calendar-title";
						subevent_container.insertAdjacentHTML("beforeend", events[e].subevents[s].description);
					}

					event_container.appendChild(subevent_container);
				}
			}
		}
	}

	// private functions
	function updateRange(range) {
		var start = range.start.split("/"),
				end = range.end.split("/");

		range.start = new Date(start[1], --start[0], 1);
		range.end = new Date(end[1], end[0], 0);

		return range;
	}

	function getConfiguration(source, properties) {
		for (var prop in properties) {
			if (properties.hasOwnProperty(prop)) {
				source[prop] = properties[prop];
			}
		}

		return source;
	}

	function convertDate(date, language, format) {
		var retorno;

		switch (format) {
			case "MM yyyy":
				retorno = date.toLocaleDateString(language, {
				   year: "numeric",
				   month: "short"
				});
				break;
			case "MMM/yy":
				retorno = date.toLocaleDateString(language, {
				   year: "2-digit",
				   month: "short"
				});
				break;
			case "MM/yyyy":
				retorno = date.toLocaleDateString(language, {
				   year: "numeric",
				   month: "numeric"
				});
				break;
			case "dd/MM":
				retorno = date.toLocaleDateString(language, {
				   month: "numeric",
				   day: "numeric"
				});
				break;
			default:
				retorno = date.toLocaleDateString(language, {
				   year: "numeric",
				   month: "numeric",
				   day: "numeric"
				});
				break;
		}

		return retorno;
	}

	function getTitle(range, language) {
		var title = { start: 0, end: 0 };

		for (var date in range) {
			title[date] = convertDate(range[date], language, "MM yyyy");
		}

		return title.start + " - " + title.end;
	}

	function getMonths(start_date, end_date, language) {
		var months = { formated: [], normal: [] },
			formated_month = convertDate(start_date, language, "MMM/yy"),
			formated_end = convertDate(end_date, language, "MMM/yy"),
			actual_month = new Date(start_date);

		do {
			months.formated.push(formated_month);
			months.normal.push(convertDate(actual_month, language, "MM/yyyy"));

			actual_month = new Date(actual_month.setMonth(actual_month.getMonth() + 1));
			formated_month = convertDate(actual_month, language, "MMM/yy");
		} while (actual_month <= end_date);

		return months;
	}

	function getGroupTitle(tr_child, link, icon, tr, text) {
		tr_child = document.createElement("th");
		tr_child.className = "team";
		link = document.createElement("a");
		link.className = "material-calendar-link toggle-all";
		link.innerHTML = text;
		icon = document.createElement("i");
		icon.className = "material-calendar-caret-down";
		link.appendChild(icon);
		tr_child.appendChild(link);
		tr.appendChild(tr_child);
	}

	function getWeeks(month, year, language, format, week_list) {
		var weeks = [],
				first_day = new Date(year, --month, 1),
				last_day = new Date(year, ++month, 0),
				total_weeks = Math.ceil( first_day.getDay() + last_day.getDate() / 7),
				day = first_day.getDay(),
				date = first_day,
				down = 0,
				last_month = 0,
				actual_month = 0;

    date.setHours(-24 * day);
		for (var i = 0; i < total_weeks; i++) {

			// if day already appears on the calendar, get next day of week (sunday, monday ..)
			while (week_list.indexOf(convertDate(date, language, "dd/MM")) >= 0) {
      	date.setDate(date.getDate() + 7);
			}

			if (weeks.length > 1) {
				last_month = weeks[weeks.length - 1].split("/")[1];
				actual_month = date.getMonth() + 1;

				if (last_month < actual_month) break;
			}

      weeks.push(convertDate(date, language, "dd/MM"));
			week_list.push(convertDate(date, language, "dd/MM"));
      date.setDate(date.getDate() + 7);
		}

    return weeks;
	}

	// Function that calc the width and the top position of the event
	// params: {
	// 	container: 	the event container
	//	start_date: the start date from the event,
	// 	row: 				the actual tr that has been used to add the event
	// 	end_date: 	the end date from the event,
	//  language: 	the default language from the calendar,
	//	format: 		the event date format
	// }
	function calcEventPositionAndWidth(container, start_date, row, end_date, real_date, language, format) {
			var width = 0,
					top = 0,
					parent = row.querySelector("[data-day='" + start_date + "']"), // td.day that has the start date
					date_list = [],
					actual_date = new Date(real_date);

			// if td.day already has a event inside, set the new event below the existing
			if (parent.className.indexOf("used") >= 0) {
					top = parent.offsetHeight;
					console.log(parent.offsetHeight);
					container.style.marginTop = top + "px";
			}

			// while the start_date it's not equal to the end_date
			// increases one day and update the start_date
		  while (actual_date <= convertStringToDate(end_date, format)) {
				if (actual_date.getTime() != real_date.getTime() && parent.className.indexOf("used") < 0) parent.className = "day used";
				width += parent.offsetWidth;
				start_date = actual_date.setHours(24);
				start_date = convertDate(actual_date, language);
				parent = row.querySelector("[data-day='" + start_date + "']");
		  }

			container.style.width = width + "px";
	}

	// Function to remove all special characters from any string received as param
	function removeSpecialChars(string) {
		string = string.replace(/[ÀÁÂÃÄÅ]/, "A")
									 .replace(/[àáâãäå]/, "a")
									 .replace(/[ÈÉÊË]/, "E")
									 .replace(/[èéêë]/, "e")
									 .replace(/[ÌÍÏ]/, "I")
									 .replace(/[ìíï]/, "i")
									 .replace(/[ÒÓÕÔÖ]/,"O")
									 .replace(/[òóõôö]/,"o")
									 .replace(/[ÙÚÛÜ]/, "U")
									 .replace(/[ùúûü]/, "u")
									 .replace(/[Ç]/,"C")
									 .replace(/[ç]/,"c");

		return string.replace(/[^a-z0-9]/gi,'').toLowerCase();
	}

	// Function that convert string to date
	// params: {
	//	date: 	the date that will be converted,
	//	format: the event date format, avaliable formats: "dd/mm/yyyy" and "mm/dd/yyyy"
	// }
	function convertStringToDate(date, format, consoleDebug) {
		var split_date = date.split("/");
		if (format === "dd/mm/yyyy") {
			date = new Date(split_date[2], --split_date[1], split_date[0]);
		} else if (format === "mm/dd/yyyy") {
			date = new Date(split_date[2], --split_date[0], split_date[1]);
		} else {
			if (consoleDebug) throw new Error("Not implemented format");
		}

		return date;
	}

	// Function to convert all dates from events array to Date using convertStringToDate
	// params: {
	//	events: the events array that will be converted,
	//	format: the event date format, avaliable formats: "dd/mm/yyyy" and "mm/dd/yyyy"
	// }
	function convertEventsDate(events, format) {
		for (var e in events) {
			events[e].start = convertStringToDate(events[e].start, format);
			events[e].end = convertStringToDate(events[e].end, format);
		}

		return events;
	}

	// Function to sort json by start date
	function sortJsonByStartDate(j, k){
		var prop = "start";
	  if (j[prop] > k[prop]) return 1;
	  else if(j[prop] < k[prop]) return -1;
	  return 0;
	}
})();
