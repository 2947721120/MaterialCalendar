(function() {
	'use stric';

	this.MaterialCalendar = function() {
		this.container = null;
		this.calendar = null;

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
	};

	MaterialCalendar.prototype.createCalendar = function() {
		build.call(this);
	};

	// build
	function build() {
		var cog = this.options,
			hasGroups = cog.groups !== undefined,
			doc, header, header_title, body, table, table_child, tr, tr_child, link, icon, months, weeks, rows, temporary, helper;

    doc = document.createDocumentFragment();

    // calendar container
    this.calendar = document.createElement("section");
  	this.calendar.className = "calendar-container " + cog.className;

  	// calendar header
  	header = document.createElement("header");
  	header.className = "calendar-header";
  	header_title = document.createElement("h2");
  	header_title.innerHTML = getTitle(cog.range, cog.language);
  	header.appendChild(header_title);
  	this.calendar.appendChild(header);

    	// calendar body
		body = document.createElement("section");
		body.className = "calendar-body";

		// table
		table = document.createElement("table");
		table.className = "calendar-table";

		// table thead
		table_child = document.createElement("thead");
		tr = document.createElement("tr");

		if (hasGroups) {
			getGroupTitle(tr_child, link, icon, tr, "todos");
		}

		months = getMonths(cog.range.start, cog.range.end, cog.language);
		for (var month in months.formated) {
			tr_child = document.createElement("th");
			tr_child.className = "month";
			tr_child.innerHTML = months.formated[month];
			tr.appendChild(tr_child);
		}

		table_child.appendChild(tr);
		table.appendChild(table_child);

		// table body
		table_child = document.createElement("tbody");
		tr = document.createElement("tr");

		if (hasGroups) {
			tr_child = document.createElement("th");
			tr.appendChild(tr_child);
		}

		for (month in months.formated) {
			tr_child = document.createElement("th");
			tr.appendChild(tr_child);

			weeks = document.createElement("table");
			weeks.className = "weeks";
			temporary = document.createElement("thead");
			weeks.appendChild(temporary);
			tr_child.appendChild(weeks);

			temporary = document.createElement("tr");
			helper = months.normal[month].split("/");
			weeks = getWeeks(helper[0], helper[1], cog.language, cog.weekStart);

			for (var week in weeks) {
				helper = document.createElement("td");
				helper.innerHTML = weeks[week];
				temporary.appendChild(helper);
			}

			tr_child.querySelector(".weeks").appendChild(temporary);
		}

		tr.appendChild(tr_child);
		table_child.appendChild(tr);

		rows = hasGroups ? cog.groups.length : 1;
		for (var i = 0; i < rows; i++) {
			tr = document.createElement("tr");

			if (hasGroups) {
				getGroupTitle(tr_child, link, icon, tr, cog.groups[i]);
			}

			for (month in months.formated) {
				tr_child = document.createElement("td");
				tr_child.className = "month";

				tr.appendChild(tr_child);
				table_child.appendChild(tr);
			}
		}

		table.appendChild(table_child);

		// append table to body
		body.appendChild(table);
		this.calendar.appendChild(body);

    	// append calendar to document fragment
    	doc.appendChild(this.calendar);

    	// append doc to container set in configuration
    	document.querySelector(cog.container).appendChild(doc);
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

		while (formated_month != formated_end) {
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
})();
