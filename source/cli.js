#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

const cli = meow(
	`
		Usage
		  $ conway_ink_js

		Options
      --numRows  Number of rows
			--numCols  Number of columns
      --interval Loop interval

		Examples
		  $ conway_ink_js --rows=10 --cols=10 --interval=150
		  Hello, Jane
	`,
	{
		importMeta: import.meta,
	},
);

render(
	<App
		numRows={cli.flags.numRows}
		numCols={cli.flags.numCols}
		interval={cli.flags.interval}
	/>,
);
