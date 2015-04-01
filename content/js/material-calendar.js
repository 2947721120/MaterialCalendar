(function() {
	'use stric';
	var perf_start = performance.now();

	this.MaterialCalendar = function() {
		this.container = null;
		this.calendar = null;
		this.messages = {
			all: "todos"
		};

		// default options
		var defaults = {
			language: "pt-BR",
			className: "full",
			weekStart: "Monday",
			range: {
				start: new Date("2015", "03", "03"),
				end: new Date("2015", "10", "03")
			},
			container: "body"
		};

		// personal options
		if (arguments[0] && typeof arguments[0] === "object") {
			this.options = getConfiguration(defaults, arguments[0]);
		} else {
			this.options = defaults;
		}

		this.createCalendar();

		if (this.options.events !== undefined) {
			this.addEvents();
		}
	};

	MaterialCalendar.prototype.createCalendar = function() {
		build.call(this);

		var perf_end = performance.now();
		console.log("build calendar took " + (perf_end - perf_start) + " milliseconds.");
	};

	MaterialCalendar.prototype.addEvents = function() {
		perf_start = performance.now();
		markEvents.call(this);
		perf_end = performance.now();
		console.log("add events took " + (perf_end - perf_start) + " milliseconds.");
	};

	// build
	function build() {
		var cog = this.options,
				msg = this.messages,
				hasGroups = cog.groups !== undefined,
				header, header_title, body, table, thead, tbody, tr, tr_child, link, icon,
				tbody_month = [], week_table, month_child, week_child, day_child, months, month, weeks, week,
				rows, temporary, helper, count;

    // calendar container
    this.calendar = document.createElement("section");
  	this.calendar.className = "calendar-container " + cog.className;

  	// calendar header
  	header = document.createElement("header");
  	header.className = "calendar-header";
  	header_title = document.createElement("h2");
  	header_title.insertAdjacentHTML("beforeend", getTitle(cog.range, cog.language));
  	header.appendChild(header_title);
  	this.calendar.appendChild(header);

  	// calendar body
		body = document.createElement("section");
		body.className = "calendar-body";

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
		months = getMonths(cog.range.start, cog.range.end, cog.language);
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
			weeks = getWeeks(helper[0], helper[1], cog.language, cog.weekStart);

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
				week_child.setAttribute("data-week", weeks[week]);

				helper = weeks[week].split("/");

				for (count = 0; count < 7; count++) {
					day_child = document.createElement("td");
					day_child.className = "day";
					day_child.setAttribute("data-day", convertDate(new Date(2015, (Number(helper[1]) - 1), (Number(helper[0]) + count)), cog.language));
					week_child.appendChild(day_child);
				}

				month_child.querySelector("tr").appendChild(week_child);
			}

			tbody_month.push(month_child);
			tr_child.querySelector(".weeks thead").appendChild(temporary);
		}

		// append a row for each group in options or just one for the main content
		rows = hasGroups ? cog.groups.length : 1;
		for (var i = 0; i < rows; i++) {
			tr = document.createElement("tr");
			tbody.appendChild(tr);

			// if has group append a th child with the group title
			if (hasGroups) {
				getGroupTitle(tr_child, link, icon, tr, cog.groups[i]);
				tr.setAttribute("data-group", removeSpecialChars(cog.groups[i]));
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
  	document.querySelector(cog.container).appendChild(this.calendar);
	}

	// add events
	function markEvents() {
		var cog = this.options,
				events = cog.events,
				actual_element, event_container, event_child, subevent_container, subevent_child, start;

		for (var e in events) {
			start = convertDate(events[e].start, cog.language);
			events[e].end = convertDate(events[e].end, cog.language);

			actual_element = document.querySelector('[data-group="' + removeSpecialChars(events[e].group) + '"]').querySelector('[data-day="' + start + '"]');

			// creates the event container
			event_container = document.createElement("section");
			event_container.className = "event cards-list grouped";
			event_container.style.width = calcWidth(start, events[e].end, events[e].start, cog.language);

			// creates the event title
			event_child = document.createElement("h3");
			event_child.className = "title";
			event_child.setAttribute("data-title", events[e].title);
			event_child.insertAdjacentHTML("beforeend", events[e].resume === undefined ? events[e].title : events[e].resume);

			// append title to event
			event_container.appendChild(event_child);
			actual_element.appendChild(event_container);

			// if has subevents append them o event
			if (events[e].subevents !== null) {
				for (var s in events[e].subevents) {
					subevent_container = document.createElement("article");
					subevent_container.className = "card";

					if (events[e].subevents[s].link !== null) {
						subevent_child = document.createElement("a");
						subevent_child.className = "title";
						subevent_child.setAttribute("href", events[e].subevents[s].link);
						subevent_child.insertAdjacentHTML("beforeend", events[e].subevents[s].description);

						subevent_container.appendChild(subevent_child);
					} else {
						subevent_child = document.createElement("h5");
						subevent_child.className = "title";
						subevent_container.insertAdjacentHTML("beforeend", events[e].subevents[s].description);
					}

					event_container.appendChild(subevent_container);
				}
			}

		// 																					{{#each tickets}}
		// 																							<article class="card">
		// 																									<div class="body">
		// 																											<h5 class="title"><a href="#">#{{codigo}} - {{descricao}}</a></h5>
		// 																									</div>
		// 																							</article>
		// 																					{{/each}}
		// 																					<a href="#modal-event" data-toggle="modal" class="actions text-center">Saiba mais</a>
		// 																					<div class="progress">
		// 																							<div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="{{progresso}}" aria-valuemin="0" aria-valuemax="100" style="width: {{progresso}}%;"></div>
		// 																					</div>
		// 																			</section>
		}
	}

	// private functions
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
			actual_month = start_date;

		months.formated.push(formated_month);
		months.normal.push(convertDate(actual_month, language, "MM/yyyy"));

		while (formated_month !== formated_end) {
			actual_month = new Date(actual_month.setMonth(actual_month.getMonth() + 1));
			formated_month = convertDate(actual_month, language, "MMM/yy");

			months.formated.push(formated_month);
			months.normal.push(convertDate(actual_month, language, "MM/yyyy"));
		}

		return months;
	}

	function getGroupTitle(tr_child, link, icon, tr, text) {
		tr_child = document.createElement("th");
		tr_child.className = "team";
		link = document.createElement("a");
		link.className = "calendar-link toggle-all";
		link.innerHTML = text;
		icon = document.createElement("i");
		icon.className = "calendar-caret-down";
		link.appendChild(icon);
		tr_child.appendChild(link);
		tr.appendChild(tr_child);
	}

	function getWeeks(month, year, language, weekStart) {
		var weeks = [],
				first_day = new Date(year, --month, 1),
				last_day = new Date(year, ++month, 0),
				total_weeks = Math.ceil( first_day.getDay() + last_day.getDate() / 7),
				day = first_day.getDay() || 7,
				date = first_day,
				down = 0,
				last_month = 0,
				actual_month = 0;

		switch (weekStart) {
			case "Sunday": 		down = 0; break;
			case "Monday": 		down = 1; break;
			case "Tuesday": 	down = 2; break;
			case "Wednesday": 	down = 3; break;
			case "Thursday": 	down = 4; break;
			case "Friday": 		down = 5; break;
			case "Saturday": 	down = 6; break;
		}

    date.setHours(-24 * (day - down));
		for (var i = 0; i < total_weeks; i++) {

			if (weeks.length > 1) {
				last_month = weeks[weeks.length - 1].split("/")[1];
				actual_month = date.getMonth() + 1;
				if (last_month < actual_month) break;
			}

      weeks.push(convertDate(date, language, "dd/MM"));
      date.setDate(date.getDate() + 7);
		}

    return weeks;
	}

	function calcWidth(start_date, end_date, real_date, language) {
			var width = 0,
					padding = 20,
					parent = document.querySelector("[data-day='" + start_date + "']");

		  while (start_date < end_date) {
				width += parent.offsetWidth;
				start_date = real_date.setHours(24);
				start_date = convertDate(real_date, language);
				start = document.querySelector("[data-day='" + start_date + "']");
		  }

			return width - padding + "px";
		}

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
})();
