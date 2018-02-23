# Rainbird Standard Agent Release Notes

The internal set of release notes. Please update the `unreleased` section with
each change you do. On release we'll create a new version and update the public
facing release notes.

## Example

  *  [New] A new feature
  *  [Fix] A bug fix
  * [Misc] Other items

## v2.18.0

  *  [Fix]   RB-1472: Fix clear not fulling clearing.
  *  [Fix]   RB-1470: Fix datasources hanging.
  *  [Fix]   RB-1463: Fix invalidResponse flag being ignored.
  *  [Fix]   RB-1462: Typing an existing date won't remove it if it exists.
  *  [Fix]   RB-1441: Date icon now toggles date picker menu.
  *  [Fix]   RB-1437: Add button for clearing dropdown selection.
  *  [Fix]   RB-1438: Fix interactions around decimal points.
  *  [Fix]   RB-1441: Add date picker icon.
  *  [Fix]   RB-1442: Fix date format
  *  [Fix]   RB-1429/30: Fix Evidence tree icon missing in try-query/agent
  *  [Fix]   RB-1432: Fix API Log not scrolling
  *  [Fix]   RB-1301: Fix the evidence tree for long numbers, or place a limit on the length of the number I can enter.
  *  [Fix]   YOL-941: Update version of Mocha due to historic nsp vulnerability.

## v2.17.0

  *  [Fix]   YOL-900: Bring up to date with release 2.16

## v2.16.4

  *  [Fix]   YOL-900: Fix canAdd setting being ignored.

## v2.16.0
  
  * [Misc] YOL-865-3: Make unidirectional plural false a toggled off feature.
  *  [Fix] YOL-865-2: Disable invalid responses when presenting second form subject questions.
  *  [New]   YOL-865: Apply plural false in one direction only, subject > object.

## v2.15.0

  *  [Fix]   RB-1357: Fix issue setting 'other' answer in answer selection array when question.concepts is undefined.
  *  [Fix]  YOL-736B: Fix agent crashing if first response is a result.
  *  [New]   YOL-736: Add question grouping to standard agent.

## v2.14.0

  *  [Fix]   RB-1286: Fix horizontal scroll bar appearing on results screen.
  * [Misc]   RB-1090: Updated readme, added server.js and bower config to help getting started.
  * [Misc]   RB-1299: Perform Standard-Agent build step as part of gulp build

## v2.13.0

  *  [Fix]  RB-1222B: Fix layout bug.
  *  [Fix]   RB-1215: Prevent question text displaying twice with second form object truth questions & respond correctly.
  *  [Fix]   RB-1222: Fix jumping between page transitions.
  * [Misc]    RB-821: Allow %C to be used in answer text for certainty.
  *  [Fix]   RB-1377: allow split screen of agent with API Log details in the split screen.

## v2.12.0

  *  [Fix]   RBA-117: Now broadcasts message when it's received goal from try-query page.
  *  [New]   RB-1220: Changes to support RB-1187 - iFrame restrictions.
  *  [Fix]   RB-1219: Bring up to date with 2.10.2.
  *  [New]    RB-859: Make agent scroll internally.
  *  [New]   RB-1186: Restrict selection in second form questions for a plural false relationship when KM facts exist.
  *  [New]   RB-1205: Condition the displaying of the back button based on the new setting.
  *  [New]   RB-1203: Standard Agent updates for autofocus.
  *  [New]   RB-1194: Implemented the back button design.
  *  [Fix]   RB-1169: Description text showing on agents.

## v2.11.0

  *  [Fix]   RB-915: Ensure enter selects continue in try/query and agents.  Set focus on results page to 'reset' button 
  					 in try/query and the 'done' button in agents.
  *  [Fix]  RB-1147: Remove Firefox class which sets the word-break css property to break between any two letters.
  *  [Misc] RB-1108: Change Evidence Tree link in order to serve from rainbird-applications.
  *  [Fix]  RB-1091: Wording next to radio buttons is a little close.

## v2.10.2

  *  [Fix] RB-1219: Make agent font size more consistent.

## v2.10.1

  *  [Fix] RB-1084: Set markdown links to open in new tab.
