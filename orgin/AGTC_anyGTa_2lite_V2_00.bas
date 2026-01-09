' Antenna temperature calculation.
' Noise rotation, without any matrixes nor mathematical rotation.
'
' One given temperature for the whole Sky.
' One given temperature for the whole Earth.
' FF Table step : 1 degree.
'
' Author: F5FOD Jean-Pierre Waymel, with the DG7YBN Hartmut Kluver's advices and suggestions.
' Date  : november 2019.
'
' Program name: Antenna G/Ta Calculator, AGTC_anyGTa_2lite_V2-00.bas    ''''''!!!!!! ooo                     +++
' Version anyGTa_2lite_V2.00                                            ''''''!!!!!! ooo                     +++
'    Recent versions of AGTC showed loss temperature (T_Loss) as INPUT loss temperature.                     +++
'    To enable cross checks with TANT we changed the table display to OUTPUT loss temperature (tnx UR5EAZ).  +++
'    What is the difference between these two Loss Temperatures?                                             +++
'    T_loss_OUT = AVG_num x T_loss_IN (AVG_num is the numerical average gain value).                         +++
'    T_loss_IN is still displayed but in the header only.                                                    +++
'    One decimal digit has been added to the AVG value.                                                      +++
'
' Version anyGTa_2lite_V1.58                                            ''''''!!!!!! ooo
'    3 decimal digits instead of 2 for T_pattern, T_loss and T_total displays.               ' ooo
'    Copes now with T_total <= 0 K (for some antennas coming with AVG very > 1).             ' ooo
'    In such a case, G/Ta value/s is/are replaced by "-99.999*" in a special color           ' ooo
'    and one single warning message in the same color is added at the bottom of the screen   ' ooo
'    when this happens on one line or any different lines whatever the number of such lines. ' ooo
'
' Version anyGTa_2lite_V1.57                                            ''''''!!!!!!
'    Proposal from UR5EAZ Vladimir Kharchenko : AG (Average Gain) has to be left as is when AG > 1.          ''''''######
'    AG no longer rounded to 1 and T_Loss no longer rounded to 0 K for calculations.                         ''''''!!!!!!
'    AG : "caution: rounded display!".                                  ''''''!!!!!!               
'    Fuchsia alert at bottom of the display if AG >= 1.001              ''''''######
'    G/T is now named G/Ta.                                             ''''''!!!!!!
'    From a Dan Maguire, AC6LA,'s idea : test on the FFTab 11th line to verify if really Azimuth slicing.    ''''''######
'
' Version 2lite
'    New program name: AGTC_2lite_V1-56.bas. '2lite' as 'too lite'.
'    From an Hartmut Kluver's suggestion: ' Close AGTC_2lite by clicking (x) in frame or'
'    written on screen (in blue) just before ' Enter FFTab's file name  _ _ _ .txt'.
'
' Version bqh_7x9K_V1.56
'    Special demand from VE7BQH Lionel Edwards to simplify the use of the program
'    and to allow a "goto" to a new FF Table file without being obliged to restart the program.
'    Infos on theta values on the screen during 
'    "Extracting the 65,341 Tot_dB values from the FF Table, 
'    looking at any possible comma and computing the 65,341 elements 
'    for the double integration".
'
' Version 7x9K_V1.56
'    Special demand first from VE7BQH Lionel Edwards via DG7YBN Hartmut Kluver
'    then from UR5EAZ Vladimir Kharchenko :
'    T_Earth <= 9,999,999 K
'    T_Sky   <= 9,999,999 K
'    New T_Earth limit: T_Earth <= 9,999,999 K (still real number).
'    New T_Sky   limit: T_Sky   <= 9,999,999 K (still real number).
'    Slightly modified display and output file lay-out for large numbers.
'
' Version 1.56
'    A bug has been discovered the 15th of march, 2018 by F5FOD : the program gave wrong results
'    and no alert if FFTab was coming from 4nec2 with a comma as decimal mark.
'    This is due to the 4nec2 FFTab format which is a little bit different from the EZNEC one,
'    especially the position of the decimal mark of the value "Tot dB".
'
'    FFTab 4nec2 format :
'    Deg    V dB      H dB      Tot dB
'      7   -26.49     -8.27     -8.21
'    179   -51,95    -16,56    -16,56
'    12345678901234567890123456789012
'             1         2         3
'
'    FFTab EZNEC format :
'     Deg      V dB      H dB      Tot dB
'      4      -31.72     -8.60     -8.58X
'    136      -19,50    -19,19    -16,33X
'    123456789012345678901234567890123456
'             1         2         3
'
'   (the "X" is a space character)
'
' Version 1.55
'    FF Table file name added in the window title before extracting the 65,341 Tot_dB values from the FF Table.
'
' Version 1.54
'    Beep when the page computation is ready in alpha range choice 3 (own range).
'
' Version 1.53
'    Management of defaults in the FFtab by 2 means : input # after the EOF and 3 first characters
'    of the last data line ("360"). The EZNEC files end with a line which contains only <CR><LF>
'    followed by a last line which contains only NULL. The 4nec2 files end only with a last line
'    which contains only NULL (no line before which would contain only <CR><LF>).
'    Beep when the page computation is ready in alpha range choice 2 (91 values from 0 to 90 deg.).
'
' Version 1.52
'    New window title with the program name.
'    0 <= T_sky < 10,000 and 0 <= T_earth < 10,000 K. Zero K to be able to do the Vladimir's UR5EAZ
'    tests : T_sky or T_earth = 0 K.
'    T_sky and T_earth displayed on top of the result screens.
'
' Version 1.51
'    Format ####.## instead of ###.## for pattern and total Temperatures as one may enter
'    Tsky =  290 K and Tearth = 5000 K at 144 MHz(Vladimir, UR5EAZ) or
'    Tsky = 2200 K and Tearth = 3000 K at  50 MHz (Hartmut, DG7YBN).
'    For azimuth = 0 deg., the same max gain may be reached at elevation = - 1 deg.
'    and elevation = 0 deg. and elevation = + 1 deg. for instance. Therefore it is the elevation
'    equal to - 1 deg. which is displayed on screen and saved in the output file.
'    This is not a bug but a fact discovered by Vladimir, UR5EAZ.
'    A modification is done to display and save elevation = 0 deg. (theta = 90 deg.) for this
'    special case.
'    For the choice "alpha 0 - 90 degr., step 1 deg.", there were 2 spaces instead of 1 space
'    in front of "Alpha (deg.)" in the corresponding title line. One space is removed.
'
' Version 1.5
'    alpha = 90 deg. exception removed because not needed.
'
' Version 1.4
'   New program name : AGTC_lite instead of AGTC.
'   "with DG7YBN" added on top of the first screen.
'   Average and Max Gains on top of each results screen with new decimal resolutions
'   and with Max Gain "azimuth" and "elevation" values.
'   Alpha is now named "antenna tilting angle".
'   One alpha choice added : from 0 to 90 degr., step 5 deg.
'   Loop to go back to the alpha choice as many times the user wants.
'   Results for the last alpha choice is saved on a file (except if the user does not want it).
'   New colors ; as soon as the results appear on the screen, they are displayed in "bold yellow"
'   with the line "30 deg." in "bold red".
'
' Version 1.3
'   "Tot_dB_max" no longer DOUBLE.
'   Field names added in the output file.
'
' Version 1.2
'   Screen messages: english typo for "?" (after an INPUT statement), "!", ":" and "...".
'   "re_enter_input_filename" renamed into "re_enter_output_filename".
'   Paging for the complete alpha range.
'   Closing the program with SYSTEM statement after having prompted the user.
'   Additions to error handler.
'
' Version 1.1
'   Bug in the dB average gain calculation eliminated.
'   Alpha = 90 deg. special case added.
'   Error trapping.
'   Choice for a personnalized alpha value range.
'
'
' Instead of rotating the antenna with an angle equal to alpha, the total noise sphere is rotated with
' an angle equal to -alpha.
'
' Due to the sorting, the range and the step of phi's and theta's, the value of a pair (phi, theta)
' is "hidden" in an index:
'   phi   = (index - 1)\181, where the "\" stands for the euclidian division (integer division);
'   theta = (index - 1) - phi * 181;
'   "- 1" is due to the fact that the index begins at "1" (as the line numbering in Excel)
'   when phi and theta begin at "0".
'
'   On the other hand, index = 181 * phi + theta + 1.
'
' An index is then a simplified way to give a pair (phi, theta).
'
'
ON ERROR GOTO error_handler
'
DIM Tot_dB(65341) AS DOUBLE ' For FF Table: 181 x 361 lines.
DIM element(65341) AS DOUBLE
'
DIM index_phi_theta AS LONG ' Integer, up to 65,341.
'
DIM sum AS DOUBLE
DIM sum(361%) AS DOUBLE ' For the trapezoidal sum on theta for a given phi.
DIM sum_sum AS DOUBLE ' For the trapezoidal sum on phi.
DIM sky1 AS DOUBLE
DIM sky2 AS DOUBLE
DIM sky3 AS DOUBLE
DIM earth1 AS DOUBLE
DIM earth2 AS DOUBLE
DIM earth3 AS DOUBLE
DIM sum_Sky(91%) AS DOUBLE ' 91 different alpha values.
DIM sum_Earth(91%) AS DOUBLE
'
DIM avg_gain_num AS DOUBLE ' The Average Gain computed at alpha = 0 deg.
DIM avg_gain_dB AS DOUBLE
'
DIM loss_dB AS DOUBLE ' The Loss computed at alpha = 0 deg.
DIM loss_temperature AS DOUBLE
DIM pattern_temperature(91%) AS DOUBLE
DIM total_temperature(91%) AS DOUBLE
DIM G_on_T_dB(91%) AS DOUBLE
DIM flag_total_temp%(91%)      ' = 0% if total_temperature() > 0 K ; = 1% if total_temperature() <= 0 K ooo
'
format_sign1_2$ = "+#.##"
format_1_3$ = "#.###"
format_sign1_3$ = "+#.###"
format_1_4$ = "#.####"         ''''''!!!!!!
format_1_5$ = "#.#####"
format_2_0$ = "##"
format_sign2_2$ = "+##.##"
format_sign2_3$ = "+##.###"
format_2_5$ = "##.#####"
format_3_0$ = "###"
format_3_2$ = "###.##"
format_sign3_2$ = "+###.##"    ''''''!!!!!!
format_3_3$ = "###.###"
format_sign3_3$ = "+###.###"   ' Due to +999.999 ooo
format_4_0$ = "####"
format_4_2$ = "####.##"
format_5_1$ = "#####.#"                  ' Not used.
format_7_2$ = "#######.##"               ' Due to 9999999.00 K.
format_comma_7_2$ = "#,###,###.##"       ' Due to 9,999,999.00 K.
format_comma_7_3$ = "#,###,###.###"      ' Due to 9,999,999.000 K.  ooo
format_comma_sign7_3$ = "+#,###,###.###" ' Due to +9,999,999.000 K. ooo
'
quote$ = CHR$(34%)
'
'
' ==> PART 1
' Asking Sky and Earth temperature.
'
CLS
_TITLE "AGTC_anyGTa_2lite v2.00: G/Ta computed with noise sphere rotation"            ''''''!!!!!! ooo+++
_DELAY 2
'
COLOR 14
PRINT " AGTC_anyGTa_2lite_V2-00"                                                      ''''''!!!!!! ooo+++
COLOR 7
PRINT " G/Ta computation from Far Field Table by F5FOD with DG7YBN and VE7BQH"        ''''''!!!!!!
PRINT
'
Sky_temperature:
PRINT " Enter   Sky Temperature (K)";
INPUT Sky_temperature
IF Sky_temperature = 0 THEN
    COLOR 9
    PRINT "         Sky Temperature (K)= 0"
    COLOR 7
END IF
IF Sky_temperature < 0 THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " Sky temperature must be >= 0 K"
    COLOR 7
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    GOTO Sky_temperature
END IF
'
IF Sky_temperature > 9999999 THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " Sky temperature too high ... must be <= 9,999,999 K"
    COLOR 7
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    GOTO Sky_temperature
END IF
'
Earth_temperature:
PRINT " Enter Earth Temperature (K)";
INPUT Earth_temperature
IF Earth_temperature = 0 THEN
    COLOR 9
    PRINT "       Earth Temperature (K)= 0"
    COLOR 7
END IF
IF Earth_temperature < 0 THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " Earth temperature must be >= 0 K"
    COLOR 7
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    PRINT "         Sky Temperature (K):"; Sky_temperature
    GOTO Earth_temperature
END IF
'
IF Earth_temperature > 9999999 THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " Earth temperature too high ... must be <= 9,999,999 K"
    COLOR 7
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    PRINT "         Sky Temperature (K):"; Sky_temperature
    GOTO Earth_temperature
END IF
'
PRINT
'
'
' ===> PART 2
' Getting Tot_dB from an EZNEC style FF Table, step 1 deg.
'
FF_Table_filename:
FOR I% = 0% to 90%                ' to reinitialize the table to 0% values ooo
    flag_total_temp%(I%) = 0%     ' idem                                   ooo
NEXT I%	                          ' idem                                   ooo
I% = 0%                           ' by security !                          ooo
'
Color 9                                                           ''''''!!!!!!''''''
PRINT " Close AGTC_anyGTa_2lite by clicking (x) in frame or"      ''''''!!!!!!
Color 7                                                           ''''''!!!!!!''''''
PRINT " Enter FFTab's file name  _ _ _ .txt";
INPUT FF_Table$
filename_length% = LEN(FF_Table$)
IF filename_length% = 0% THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " You did not set any FFtab file name" 'Length of file name is null ...
 '   COLOR 7    !!!!!!######
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    GOTO FF_Table_filename
END IF
'
'
' Verifying that the FF Table is really "Azimuth sliced" and step 1 deg.    ''''''######
CLOSE 1%
20 OPEN FF_Table$ FOR INPUT AS #1%
' Verifying if FF Table is really "Azimuth sliced".       ''''''######
FOR I% = 1% TO 10% ' To remove the EZNEC FF Table top.    ''''''######
    LINE INPUT #1%, top$
NEXT I%
LINE INPUT #1%, Azimuth$ ' To get the "Azimuth" line.     ''''''######
IF LEFT$(Azimuth$, 7%) <> "Azimuth" THEN                  ''''''######
    BEEP                                                  ''''''######
	PRINT                                                 ''''''######
	COLOR 12                                              ''''''######
    PRINT " The FF Table file is not in accordance with the right format"    ''''''######
    PRINT " (due to wrong number of lines and/or wrong content of lines"     ''''''######
    PRINT " and/or not organized as Azimuth slices)."                        ''''''######
    PRINT            ''''''######
	COLOR 9          ''''''######
    PRINT " Press any key to continue!";    ''''''######
    COLOR 7          ''''''######
    GOSUB waiting    ''''''######
    CLS              ''''''######
	GOTO FF_Table_filename                  ''''''######
END IF               ''''''######
'                    ''''''######
' Verifying if FF Table step = 1 deg.              ''''''######
LINE INPUT #1%, A$ ' To remove "Deg." line.        ''''''######
LINE INPUT #1%, A$ ' To get the  first phi value.
azimuth_0$ = LEFT$(A$, 3%)
azimuth_0 = VAL(azimuth_0$)
LINE INPUT #1%, A$ ' To get the second phi value
azimuth_1$ = LEFT$(A$, 3%)
azimuth_1 = VAL(azimuth_1$)
IF azimuth_1 - azimuth_0 <> 1% THEN
    BEEP
    PRINT
    COLOR 12
    PRINT " The FF Table must be of 1 deg. resolution but is not!"
    PRINT
    COLOR 9
'    PRINT " Please close the program window ..."    ''''''######	
    PRINT " Press any key to continue!";             ''''''######
    COLOR 7
'   END                         ''''''###### 
	GOSUB waiting               ''''''######
    CLS                         ''''''######
    GOTO FF_Table_filename      ''''''###### 
END IF
CLOSE 1%
'
_TITLE "AGTC_anyGTa_2lite v2.00" + SPACE$(9%) + "FFTab: " + FF_Table$   ''''''!!!!!! ooo+++
_DELAY 2
'
OPEN FF_Table$ FOR INPUT AS #1%
FOR I% = 1% TO 9% ' To remove the EZNEC FF Table header.
    LINE INPUT #1%, header$
NEXT I%
'
PRINT
PRINT " Extracting the 65,341 Tot_dB values from the FF Table,"
PRINT " looking at any possible comma and computing"
PRINT " the 65,341 elements for the double integration,"
PRINT " please, wait ..."
PRINT                                               ''''''!!!!!!''''''
Tot_dB_max = -1000
FOR theta% = 180% TO 0% STEP -1% ' The FF Table "Elevation" goes from -90 deg. to +90 deg.
    '                     and theta = 90 - elevation.
    100 LINE INPUT #1%, A$ ' To remove the empty    line.
    110 LINE INPUT #1%, A$ ' To remove "Azimuth ..." line.
    120 LINE INPUT #1%, A$ ' To remove " Deg ..."    line.
    FOR phi% = 0% TO 360%
        130 LINE INPUT #1%, A$
        Tot_dB$ = MID$(A$, 26%, 10%) ' Format: "1234567.90".
        mark_comma% = INSTR(Tot_dB$, ",") ' Where is the possible comma ?
        '
        IF mark_comma% = 5% THEN ' 4nec2 case
            IF theta% = 180% AND phi% = 0% THEN ' To display the following message only once
                PRINT
                COLOR 9
                PRINT " Replacing commas by dots, please wait a little more!"
                COLOR 7
                PRINT
            END IF
            before$ = LEFT$(Tot_dB$, 4%) ' Data before the comma
            after$ = RIGHT$(Tot_dB$, 2%) ' Data after  the comma
            Tot_dB$ = before$ + "." + after$ ' Tot_dB$ now with a dot
        END IF
        '
        IF mark_comma% = 8% THEN ' EZNEC case
            IF theta% = 180% AND phi% = 0% THEN
                PRINT
                COLOR 9
                PRINT " Replacing commas by dots, please wait a little more!"
                COLOR 7
                PRINT
            END IF
            before$ = LEFT$(Tot_dB$, 7%)
            after$ = RIGHT$(Tot_dB$, 2%)
            Tot_dB$ = before$ + "." + after$
        END IF
        '
        index_phi_theta = 181% * phi% + theta% + 1% ' Sort: increasing phi increasing theta.
        Tot_dB(index_phi_theta) = VAL(Tot_dB$)
        IF Tot_dB(index_phi_theta) > Tot_dB_max THEN ' Searching for Tot_dB max
            Tot_dB_max = Tot_dB(index_phi_theta)
            phi_gain_max% = phi%
            theta_gain_max% = theta%
        END IF
        '
        element(index_phi_theta) = 10 ^ (Tot_dB(index_phi_theta) / 10%) * SIN(_PI / 180% * theta%) * (_PI / 180% * 1%) ^ 2%
        '       (angles: in radians)       Tot_num                          * sin(theta)             * d(theta) * d(phi).
        '
		NEXT phi%
	IF theta% = 180% THEN                         ''''''!!!!!!''''''
	    PRINT " theta = ";                        ''''''!!!!!!''''''
        PRINT USING format_3_0$; theta%;              ''''''!!!!!!''''''
	    PRINT " degrees ..."                      ''''''!!!!!!''''''				
	END IF                                        ''''''!!!!!!''''''
	'                                             ''''''!!!!!!''''''
	IF theta% = 135% THEN                         ''''''!!!!!!''''''
	    PRINT " theta = ";                        ''''''!!!!!!''''''
        PRINT USING format_3_0$; theta%;              ''''''!!!!!!''''''
	    PRINT " degrees ..."                      ''''''!!!!!!''''''				
	END IF                                        ''''''!!!!!!''''''
	'                                             ''''''!!!!!!''''''
	IF theta% = 90% THEN                          ''''''!!!!!!''''''
	    PRINT " theta = ";                        ''''''!!!!!!''''''
        PRINT USING format_3_0$; theta%;              ''''''!!!!!!''''''
	    PRINT " degrees ..."                      ''''''!!!!!!''''''				
	END IF                                        ''''''!!!!!!''''''
	'                                             ''''''!!!!!!''''''
	IF theta% = 45% THEN                          ''''''!!!!!!''''''
	    PRINT " theta = ";                        ''''''!!!!!!''''''
        PRINT USING format_3_0$; theta%;              ''''''!!!!!!''''''
	    PRINT " degrees ..."                      ''''''!!!!!!''''''				
    END IF                                            ''''''!!!!!!''''''
	'                                             ''''''!!!!!!''''''
	IF theta% = 30% THEN                          ''''''!!!!!!''''''
	    PRINT " theta = ";                        ''''''!!!!!!''''''
        PRINT USING format_3_0$; theta%;              ''''''!!!!!!''''''
	    PRINT " degrees ..."                      ''''''!!!!!!''''''				
    END IF                                            ''''''!!!!!!''''''
	'  		                              ''''''!!!!!!''''''
NEXT theta%
'
IF LEFT$(A$, 3%) <> "360" THEN ' Test on the beginning of the last data line.
    BEEP
    PRINT
    COLOR 12
    PRINT " The FF Table file is not in accordance with the right format"
    PRINT " (number of lines and/or content of lines)."
    PRINT
    COLOR 9
'    PRINT " Please close the program window ..."    ''''''######
    PRINT " Press any key to continue!";             ''''''######
    COLOR 7
'    END                        ''''''######
	GOSUB waiting               ''''''######
    CLS                         ''''''######
    GOTO FF_Table_filename      ''''''###### 
END IF
'
IF Tot_dB(91%) = Tot_dB_max THEN theta_gain_max% = 90% ' If the gain at phi = 0 deg. and theta = 90 deg. (=> index = 91)
'                             is equal to the max gain, then 90 deg. is elected
'                             as the value for max gain theta to be displayed on screen and
'                             recorded in the output file.
'
CLOSE 1%
'
'
' ===> PART 3
' Calculating the average gain and T_loss at alpha = 0 deg.
'
alpha% = 0%
GOSUB areas
sum_Sky_avg_gain = sum_Sky(alpha%)
sum_Earth_avg_gain = sum_Earth(alpha%)
'
avg_gain_num = (sum_Sky_avg_gain + sum_Earth_avg_gain) / (4 * _PI)
avg_gain_dB = 10% * (LOG(avg_gain_num)) / LOG(10.#)    ''''''!!!!!!
'
loss_dB = -avg_gain_dB
loss_temperature = 290% * (1 / avg_gain_num - 1%) ' +++ CAUTION : it is the INPUT loss-temperature !
' IF avg_gain_num > 0.999 THEN loss_temperature = 0 ' For a lossless antenna   ''''''!!!!!!
'
'
' ===> PART 4
' Alpha choice and Calculating T_pattern, T_total and G/T.
'
'alpha_choice:
'CLS
'COLOR 7 ' By security !
'PRINT " Alpha is antenna tilting angle in degrees."
'PRINT " Now enter range of alpha for computation:"
'PRINT SPACE$(2%); "- for alpha 0 - 90 degr., step 5 deg.: type "; quote$; "1"; quote$; ","
'PRINT SPACE$(2%); "- for alpha 0 - 90 degr., step 1 deg.: type "; quote$; "2"; quote$; ","
'PRINT SPACE$(2%); "- for your own alpha value range     : type "; quote$; "3"; quote$; ","
'PRINT SPACE$(2%); "- for a single alpha value           : type "; quote$; "4"; quote$
'PRINT
'PRINT " Enter # =>";
'INPUT choice%
'IF choice% <> 1% AND choice% <> 2% AND choice% <> 3% AND choice% <> 4% THEN
'    BEEP
'    PRINT
'    COLOR 12
'    PRINT " Enter only 1, 2, 3 or 4 for your choice!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    GOTO alpha_choice
'END IF
''
'SELECT CASE choice%
'    CASE 1%:
        alpha_save_begin% = 0% ' Will be used to save the data in the output file.
        alpha_save_end% = 90%
        alpha_save_step% = 5%
        CLS
        GOSUB on_screen_avg_max_gains
        COLOR 14
        PRINT " Alpha (deg.)"; SPACE$(2%); "T_pattern (K)"; SPACE$(3%); "T_loss_OUT (K)"; SPACE$(6%); "T_total (K)"; SPACE$(5%); "G/Ta (dB)" ''''''!!!!!! 6 spaces ooo+++
        FOR alpha% = 0% TO 90% STEP 5%
            GOSUB areas
            GOSUB calculations
        NEXT alpha%
		'
        total_flag_total_temp% = 0%                                                ' to calculate the total number of lines where T_total <= 0 ooo
        FOR I% = 0% to 90%                                                         ' idem ooo
            total_flag_total_temp% = total_flag_total_temp% + flag_total_temp%(I%) ' idem ooo
        NEXT I%                                                                    ' idem ooo
		I% = 0%                                                                    ' by security ooo
		IF total_flag_total_temp% >= 1% THEN                                             ' when 1 or more lines have a T_total <= 0 ooo
		    COLOR 13                                                                     ' idem ooo
			LOCATE 24,7                                                                  ' idem ooo
		    PRINT "    *: this dummy value is displayed to show that T_total (K) is <= O!*"; ' idem and look at the final semi-colon ooo+++
		    COLOR 9                                                                      ' idem and by security ooo
		END IF                                                                           ' idem ooo    
		'
        LOCATE 25, 1
        COLOR 9
        PRINT " Press any key to continue";                                        ''''''######
		IF avg_gain_num >= 1.001 THEN                                              ''''''######
		    COLOR 13                                                               ''''''!!!!!!
			PRINT " Computed AG >= 1.001, G/Ta corrections may be needed";         ''''''######
	    END IF                                                                     ''''''!!!!!!
        COLOR 7
        GOSUB waiting
		CLS                                          ''''''!!!!!!''''''
		GOTO FF_Table_filename                       ''''''!!!!!!''''''
'    CASE 2%:
'        alpha_save_begin% = 0%
'        alpha_save_end% = 90%
'        alpha_save_step% = 1%
'        CLS
'        GOSUB on_screen_avg_max_gains
'        first_alpha% = 0% ' 19 alpha value lines max per page
'        last_alpha% = 18%
'        GOSUB total_range
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'        '
'        CLS
'        GOSUB on_screen_avg_max_gains
'        first_alpha% = 19%
'        last_alpha% = 37%
'        GOSUB total_range
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'        '
'        CLS
'        GOSUB on_screen_avg_max_gains
'        first_alpha% = 38%
'        last_alpha% = 56%
'        GOSUB total_range
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'        '
'        CLS
'        GOSUB on_screen_avg_max_gains
'        first_alpha% = 57%
'        last_alpha% = 75%
'        GOSUB total_range
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'        '
'        CLS
'        GOSUB on_screen_avg_max_gains
'        first_alpha% = 76%
'        last_alpha% = 90%
'        GOSUB total_range
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'    CASE 3%:
'        choice3_first:
'        PRINT " Your choice for the first alpha value";
'        INPUT first_alpha%
'        IF first_alpha% = 0% THEN
'            COLOR 9
'            PRINT " First alpha value = 0 deg."
'            COLOR 7
'            PRINT
'            GOTO choice3_last
'        END IF
'        IF first_alpha% < 0% OR first_alpha% > 89% THEN
'            BEEP
'            COLOR 12
'            PRINT " First alpha value must be contained between 0 and 89 deg. inclusively!"
'            COLOR 7
'            PRINT
'            GOTO choice3_first
'        END IF
'        PRINT
'        choice3_last:
'        PRINT " Your choice for the  last alpha value";
'        INPUT last_alpha%
'        IF last_alpha% <= first_alpha% THEN
'            BEEP
'            COLOR 12
'            PRINT " Last alpha value must be greater than the first alpha value!"
'            COLOR 7
'            PRINT
'            GOTO choice3_last
'        END IF
'        '
'        IF last_alpha% > 90% THEN
'            BEEP
'            COLOR 12
'            PRINT " Maximum last alpha value is equal to 90 deg.!"
'            COLOR 7
'            PRINT
'            GOTO choice3_last
'        END IF
'        '
'        alpha_save_begin% = first_alpha%
'        alpha_save_end% = last_alpha%
'        alpha_save_step% = 1%
'        n% = 0% ' Page number - 1
'        page_screen:
'        IF last_alpha% - (first_alpha% + 19% * n%) + 1% <= 19% THEN ' Here 19 alpha value lines max per page
'            CLS
'            GOSUB on_screen_avg_max_gains
'            COLOR 14
'            PRINT " Alpha (deg.)"; SPACE$(2%); "T_pattern (K)"; SPACE$(3%); "T_loss (K)"; SPACE$(3%); "T_total (K)"; SPACE$(5%); "G/T (dB)"
'            FOR alpha% = first_alpha% + 19% * n% TO last_alpha%
'                GOSUB areas
'                GOSUB calculations
'            NEXT alpha%
'            LOCATE 25, 1
'            COLOR 9
'            PRINT " Press any key to continue!";
'            BEEP
'            COLOR 7
'            GOSUB waiting
'            GOTO end_select
'        END IF
'        '
'        CLS
'        GOSUB on_screen_avg_max_gains
'        COLOR 14
'        PRINT " Alpha (deg.)"; SPACE$(2%); "T_pattern (K)"; SPACE$(3%); "T_loss (K)"; SPACE$(3%); "T_total (K)"; SPACE$(5%); "G/T (dB)"
'        FOR alpha% = first_alpha% + 19% * n% TO first_alpha% + (n% + 1%) * 19% - 1%
'            GOSUB areas
'            GOSUB calculations
'        NEXT alpha%
'        n% = n% + 1%
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        BEEP
'        COLOR 7
'        GOSUB waiting
'        GOTO page_screen
'        '
'    CASE 4%:
'        choice4:
'        PRINT " Your choice for alpha";
'        INPUT alpha%
'        IF alpha% < 0% OR alpha% > 90% THEN
'            BEEP
'            COLOR 12
'            PRINT " Alpha must be between 0 to 90 degr. inclusively!"
'            COLOR 7
'            PRINT
'            GOTO choice4
'        END IF
'        CLS
'        alpha_save_begin% = alpha%
'        alpha_save_end% = alpha%
'        alpha_save_step% = 1%
'        GOSUB on_screen_avg_max_gains
'        COLOR 14
'        PRINT " Alpha (deg.)"; SPACE$(2%); "T_pattern (K)"; SPACE$(3%); "T_loss (K)"; SPACE$(3%); "T_total (K)"; SPACE$(5%); "G/T (dB)"
'        GOSUB areas
'        GOSUB calculations
'        LOCATE 25, 1
'        COLOR 9
'        PRINT " Press any key to continue!";
'        COLOR 7
'        GOSUB waiting
'        end_select:
'END SELECT
'
'GOSUB new_alpha_choice
'
SYSTEM ' By security!
'
' ############################## SUBROUTINES ##############################
'
total_range: ' Alpha = 0 to 90 deg., step 1 deg.
COLOR 14
PRINT " Alpha (deg.)"; SPACE$(2%); "T_pattern (K)"; SPACE$(3%); "T_loss (K)"; SPACE$(3%); "T_total (K)"; SPACE$(4%); "G/T (dB)" '
FOR alpha% = first_alpha% TO last_alpha% ' One page of results per screen
    GOSUB areas
    GOSUB calculations
NEXT alpha%
'
RETURN
' *************************************************************************
'
on_screen_avg_max_gains: ' Average and Max gains on top of results screen
'                 and also T_sky and T_earth.
IF avg_gain_num <= 1 THEN    ''''''!!!!!!
    COLOR 15
    PRINT " Average Gain (AG, caution: rounded display!) = "; USING format_1_4$; avg_gain_num;    ''''''!!!!!!+++
    PRINT " (/) = ";
    PRINT USING format_sign1_2$; avg_gain_dB;
    PRINT " dBi"
    PRINT " Max Gain = ";
    PRINT USING format_sign2_2$; Tot_dB_max;
    PRINT " dBi at azimuth = ";
    PRINT USING format_3_0$; phi_gain_max%;
    PRINT " degree(s) and elevation = ";
    PRINT USING format_3_0$; 90% - theta_gain_max%;
    PRINT " degree(s)"
    COLOR 9
    PRINT SPACE$(1%); " T_sky = "; USING format_comma_7_2$; Sky_temperature;
    PRINT " K";
    PRINT SPACE$(4%);   ' Due to large number.+++
	COLOR 15                                 '+++
	PRINT "T_loss_IN = ";                    '+++
	PRINT USING format_sign3_3$; loss_temperature; ' INPUT loss_temperature ! +++
	PRINT " K";                              '+++
	PRINT SPACE$(4%);                        '+++
	COLOR 9                                  '+++
    PRINT " T_earth = "; USING format_comma_7_2$; Earth_temperature;
    PRINT " K"
    COLOR 7
END IF
'
IF avg_gain_num > 1 THEN    ''''''!!!!!!
    COLOR 13                ''''''!!!!!!
    PRINT " Average Gain (AG, caution: rounded display!) = "; USING format_1_4$; avg_gain_num;    ''''''!!!!!!+++
    PRINT " (/) = ";
    PRINT USING format_sign1_2$; avg_gain_dB;
    PRINT " dBi"
	COLOR 15            ''''''!!!!!!
    PRINT " Max Gain = ";
    PRINT USING format_sign2_2$; Tot_dB_max;
    PRINT " dBi at azimuth = ";
    PRINT USING format_3_0$; phi_gain_max%;
    PRINT " degree(s) and elevation = ";
    PRINT USING format_3_0$; 90% - theta_gain_max%;
    PRINT " degree(s)"
    COLOR 9
    PRINT SPACE$(1%); " T_sky = "; USING format_comma_7_2$; Sky_temperature;
    PRINT " K";
    PRINT SPACE$(4%);   ' Due to large number.+++
	COLOR 15                                 '+++
	PRINT "T_loss_IN = ";                    '+++
	PRINT USING format_sign3_3$; loss_temperature; ' INPUT loss_temperature ! +++
	PRINT " K";                              '+++
	PRINT SPACE$(4%);                        '+++
	COLOR 9                                  '+++
    PRINT " T_earth = "; USING format_comma_7_2$; Earth_temperature;
    PRINT " K"
    COLOR 7
END IF
'
RETURN
' *************************************************************************
'
'new_alpha_choice:
'CLS
'COLOR 7
'PRINT " Enter another range of alpha for computation ";
'COLOR 15
'PRINT "(Y/N)";
'COLOR 7
'PRINT "?"
'PRINT
'PRINT " Enter # =>";
'INPUT save_choice$
'IF save_choice$ <> "Y" AND save_choice$ <> "y" AND save_choice$ <> "N" AND save_choice$ <> "n" THEN
'    BEEP
'    COLOR 12
'    PRINT " Enter only "; quote$; "Y"; quote$; " or "; quote$; "N"; quote$; "!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    GOTO new_alpha_choice
'END IF
''
'IF save_choice$ = "Y" OR save_choice$ = "y" THEN GOTO alpha_choice
''
'' No new alpha choice
'save_or_quit:
'CLS
'COLOR 7
'PRINT " Save last alpha choice results ";
'COLOR 15
'PRINT "(Y/N)";
'COLOR 7
'PRINT "?"
'PRINT " "; quote$; "N"; quote$; " will close AGTC without any results saving!"
'PRINT
'PRINT " Enter # =>";
'INPUT save_choice$
''IF save_choice$ <> "Y" AND save_choice$ <> "y" AND save_choice$ <> "N" AND save_choice$ <> "n" THEN
'    BEEP
'    COLOR 12
'    PRINT " Enter only "; quote$; "Y"; quote$; " or "; quote$; "N"; quote$; "!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    GOTO save_or_quit
'END IF
''
'IF save_choice$ = "Y" OR save_choice$ = "y" THEN GOSUB save_results
'SYSTEM
''
'RETURN
' *************************************************************************
'
areas:
' Sky1: az = 0 to 90 deg. ; el = + 90 deg. to - alpha (theta = 0 deg. to 90 + alpha)
begin_phi% = 0%
end_phi% = 90%
begin_theta% = 0%
end_theta% = 90% + alpha%
GOSUB trapezoidal_sums
sky1 = sum_sum
'
' Sky2: az = 270 to 360 deg. ; el = + 90 deg. to - alpha (theta = 0 deg. to 90 + alpha)
begin_phi% = 270%
end_phi% = 360%
begin_theta% = 0%
end_theta% = 90% + alpha%
GOSUB trapezoidal_sums
sky2 = sum_sum
'
' Sky3: az = 90 to 270 deg. ; el = + 90 deg. to + alpha (theta = 0 deg. to 90 - alpha)
begin_phi% = 90%
end_phi% = 270%
begin_theta% = 0%
end_theta% = 90% - alpha%
GOSUB trapezoidal_sums
sky3 = sum_sum
'
sum_Sky(alpha%) = sky1 + sky2 + sky3
'
' Earth1: az = 0 to 90 deg. ; el = - alpha to - 90 deg. (theta = 90 + alpha to 180 deg.)
begin_phi% = 0%
end_phi% = 90%
begin_theta% = 90% + alpha%
end_theta% = 180%
GOSUB trapezoidal_sums
earth1 = sum_sum
'
' Earth2: az = 270 to 360 deg. ; el = - alpha to - 90 deg. (theta = 90 + alpha to 180 deg.)
begin_phi% = 270%
end_phi% = 360%
begin_theta% = 90% + alpha%
end_theta% = 180%
GOSUB trapezoidal_sums
earth2 = sum_sum
'
' Earth3: az = 90 to 270 deg. ; el = alpha to - 90 deg. (theta = 90 - alpha to 180 deg.)
begin_phi% = 90%
end_phi% = 270%
begin_theta% = 90% - alpha%
end_theta% = 180%
GOSUB trapezoidal_sums
earth3 = sum_sum
'
sum_Earth(alpha%) = earth1 + earth2 + earth3
'
RETURN
' *************************************************************************
'
calculations:
' Computing and displaying T_pattern, T_total, G/Ta    ''''''!!!!!!
pattern_temperature(alpha%) = (Sky_temperature * sum_Sky(alpha%) + Earth_temperature * sum_Earth(alpha%)) / (sum_Sky(alpha%) + sum_Earth(alpha%))
total_temperature(alpha%) = (pattern_temperature(alpha%) - 290) * avg_gain_num + 290
' IF avg_gain_num > 0.999 THEN total_temperature(alpha%) = pattern_temperature(alpha%) ' For a lossless antenna    ''''''!!!!!!
IF total_temperature(alpha%) <= 0 THEN        ' to set the flag when the line shows a T_total <= 0 ooo
    flag_total_temp%(alpha%) = 1%             ' idem ooo
    G_on_T_dB(alpha%) = -99.999               ' idem dummy value ooo
        ELSE                                  ' idem ooo
        G_on_T_dB(alpha%) = Tot_dB_max - 10% * (LOG(total_temperature(alpha%))) / LOG(10.#)''''''!!!!!!
END IF                                        ' idem ooo
'
IF alpha% = 30% THEN COLOR 12
PRINT SPACE$(6%);
PRINT USING format_2_0$; alpha%;
PRINT SPACE$(7%);                                             ' Due to 1 more decimal value ooo
PRINT USING format_comma_7_3$; pattern_temperature(alpha%);   ' 1 more decimal value ooo
PRINT SPACE$(9%);                                             ''''''!!!!!! Due to 1 more decimal value ooo      +++
PRINT USING format_sign3_3$; loss_temperature * avg_gain_num ;                ''''''!!!!!! 1 more decimal value CAUTION : OUTPUT loss_temperature ooo+++
PRINT SPACE$(3%);                                             ''''''!!!!!! Due to 1 more decimal value ooo
PRINT USING format_comma_sign7_3$; total_temperature(alpha%); ' sign and 1 more decimal value ooo
PRINT SPACE$(7%);                                             ''''''!!!!!! Due to 1 more decimal value ooo
IF total_temperature(alpha%) <= 0 THEN                 ' new color for G/Ta ooo
    COLOR 13                                           ' ooo
    PRINT USING format_sign2_3$; G_on_T_dB(alpha%);    ' ooo
    PRINT "*"                                          ' ooo
        ELSE                                           ' ooo
	    PRINT USING format_sign2_3$; G_on_T_dB(alpha%)
END IF	                                               ' ooo
COLOR 14
'
RETURN
' *************************************************************************
'
trapezoidal_sums:
' Calculating the double sum (trapezoidal sum on theta then trapezoidal sum on phi)
' on ranges of phi and a ranges of theta.
'
FOR phi% = begin_phi% TO end_phi% ' Trapezoidal sum on theta for each phi.
    sum = 0
    FOR theta% = begin_theta% + 1% TO end_theta% - 1%
        index_phi_theta = 181% * phi% + theta% + 1%
        sum = sum + element(index_phi_theta)
    NEXT theta%
    '
    index_phi_theta = 181% * phi% + begin_theta% + 1%
    sum = sum + (element(index_phi_theta)) / 2%
    index_phi_theta = 181% * phi% + end_theta% + 1%
    sum = sum + (element(index_phi_theta)) / 2%
    sum(phi%) = sum
NEXT phi%
'
sum_sum = 0 ' Trapezoidal sum on phi.
FOR phi% = begin_phi% + 1% TO end_phi% - 1%
    sum_sum = sum_sum + sum(phi%)
NEXT phi%
'
sum_sum = sum_sum + (sum(begin_phi%) + sum(end_phi%)) / 2%
'
RETURN
' *************************************************************************
'
waiting:
' Waiting for pressing any key
waiting$ = ""
WHILE waiting$ = ""
    waiting$ = INKEY$
WEND
'
RETURN
'' *************************************************************************
''
'save_results:
'' Saving the results corresponding to the last alpha choice.
'PRINT " Please type name of file name for saving results to"
'PRINT " Enter name without extension: "; quote$; ".txt"; quote$; " will be added."
'PRINT " Be careful if this file name + extension is already in use in your directory"
'PRINT " as it will be erased !"
'PRINT
'PRINT " Enter file name for Output";
'INPUT result_filename$
''
'filename_length% = LEN(result_filename$)
'IF filename_length% = 0% THEN
'    BEEP
'    PRINT
'    COLOR 12
'    PRINT " You did not set any file name" 'Length of file name is null ...
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    CLS
'    GOTO save_results
'END IF
''
'FOR I% = 1% TO LEN(result_filename$)
'    character$ = MID$(result_filename$, I%, 1%)
'    IF character$ = "." OR character$ = ":" OR character$ = "/" THEN
'        BEEP
'        PRINT
'        COLOR 12
'        PRINT " No special characters like  .  :  /  allowed in file name!"
'        COLOR 7
'        PRINT
'        COLOR 9
'        PRINT " Press any key to continue!";
'        COLOR 7
'        GOSUB waiting
'        CLS
'        GOTO save_results
'    END IF
'NEXT I%
'PRINT
''
'result_filename$ = result_filename$ + ".txt"
'CLOSE 2%
'10 OPEN result_filename$ FOR OUTPUT AS #2%
'PRINT #2%, "Program name           : ";
'PRINT #2%, "AGTC_lite_7x9K_V1-56.bas"
'PRINT #2%, "This output file name  : ";
'PRINT #2%, result_filename$
'PRINT #2%, "Date (mm-dd-yyyy)      : ";
'PRINT #2%, DATE$
'PRINT #2%, "Time (hh-mm-ss)        : ";
'PRINT #2%, TIME$
'PRINT #2%,
''
'PRINT #2%, "Sky   Temperature      : ";
'PRINT #2%, USING format_comma_7_2$; Sky_temperature;
'PRINT #2%, " K"
'PRINT #2%, "Earth Temperature      : ";
'PRINT #2%, USING format_comma_7_2$; Earth_temperature;
'PRINT #2%, " K"
'PRINT #2%,
''
'PRINT #2%, "FF Table file name     : ";
'PRINT #2%, FF_Table$
'PRINT #2%,
''
'PRINT #2%, "Max     Gain           : ";
'PRINT #2%, USING format_sign2_2$; Tot_dB_max;
'PRINT #2%, " dBi at phi = ";
'PRINT #2%, USING format_3_0$; phi_gain_max%;
'PRINT #2%, " degree(s)   and theta = ";
'PRINT #2%, USING format_3_0$; theta_gain_max%;
'PRINT #2%, " degree(s)"
'PRINT #2%, SPACE$(34%); "with phi = EZNEC "; quote$; "azimuth"; quote$; " and theta =  90 - EZNEC "; quote$; "elevation"; quote$; " (deg.)"
'PRINT #2%,
''
'IF avg_gain_num <= 0.999 THEN
'    PRINT #2%, "Average Gain (Avg_Gain): "; USING format_1_5$; avg_gain_num;
'    PRINT #2%, " (/) = ";
'    PRINT #2%, USING format_sign1_3$; avg_gain_dB;
'    PRINT #2%, " dBi"
'END IF
'IF avg_gain_num > 0.999 THEN
'    PRINT #2%, "Average Gain (Avg_Gain): "; USING format_1_5$; avg_gain_num;
'    PRINT #2%, " (/) = ";
'    PRINT #2%, USING format_sign1_3$; avg_gain_dB;
'    PRINT #2%, " dBi, rounded to 1 (0 dBi)!"
'END IF
'PRINT #2%,
''
'PRINT #2%, "Sky   zones            : ";
'PRINT #2%, USING format_2_5$; sum_Sky_avg_gain
'PRINT #2%, "Earth zones            : ";
'PRINT #2%, USING format_2_5$; sum_Earth_avg_gain
'PRINT #2%, "Total zone             : ";
'PRINT #2%, USING format_2_5$; sum_Sky_avg_gain + sum_Earth_avg_gain
'PRINT #2%,
''
'PRINT #2%, "alpha    T_pattern T_loss        T_tot     G/T      Sky    Earth    Total Local_Avg_Gain LAG/Avg_Gain  alpha"   ' Due to large numbers.
'PRINT #2%, " deg.            K      K            K      dB    zones    zones     zone          (LAG)                deg."   ' Due to large numbers.
'FOR alpha% = alpha_save_begin% TO alpha_save_end% STEP alpha_save_step%
'    PRINT #2%, SPACE$(3%);
'    PRINT #2%, USING format_2_0$; alpha%;
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_comma_7_2$; pattern_temperature(alpha%);
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_3_2$; loss_temperature;
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_comma_7_2$; total_temperature(alpha%);
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_sign2_3$; G_on_T_dB(alpha%);
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_2_5$; sum_Sky(alpha%);
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_2_5$; sum_Earth(alpha%);
'    PRINT #2%, SPACE$(1%);   ' Due to large numbers.
'    PRINT #2%, USING format_2_5$; sum_Sky(alpha%) + sum_Earth(alpha%);
'    PRINT #2%, SPACE$(8%);   ' Due to large numbers.
'    PRINT #2%, USING format_1_5$; (sum_Sky(alpha%) + sum_Earth(alpha%)) / (4% * _PI);
'    PRINT #2%, SPACE$(4%);   ' Due to large numbers.
'    PRINT #2%, USING format_3_3$; (((sum_Sky(alpha%) + sum_Earth(alpha%)) / (4% * _PI)) / avg_gain_num) * 100%;
'    PRINT #2%, " %";
'    PRINT #2%, SPACE$(5%);   ' Due to large numbers.
'    PRINT #2%, USING format_2_0$; alpha%
'NEXT alpha%
''
'CLOSE 2%
''
'RETURN
' #########################################################################
'
error_handler:
'IF ERR = 53% AND ERL = 10% THEN ' Error when opening the output file due to
'    '                         an inappropriate character in its name.
'    BEEP
'    COLOR 12
'    PRINT " No  <  >  ?  *  "; quote$; "  <ESC>  in the file name!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    CLS
'    RESUME save_results
'END IF
''
'IF ERR = 70% AND ERL = 10% THEN ' Error when opening the output file as a file
'    '                         with the same name is already opened in another application.
'    BEEP
'    COLOR 12
'    PRINT " A file with the same name is already opened in another application!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    CLS
'    RESUME save_results
'END IF
''
'IF ERR = 76% AND ERL = 10% THEN ' Error when opening the output file due to
'    '                         its too long filename.
'    BEEP
'    COLOR 12
'    PRINT " Filename exceeds 222 characters!"
'    COLOR 7
'    PRINT
'    COLOR 9
'    PRINT " Press any key to continue!";
'    COLOR 7
'    GOSUB waiting
'    CLS
'    RESUME save_results
'END IF
'
IF ERR = 53% AND ERL = 20% THEN ' FF Table file not found
    BEEP
    PRINT
    COLOR 12
    PRINT " The FF Table file has not been found!"
'    COLOR 7    ''''''######	
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    RESUME FF_Table_filename
END IF
'
IF (ERR = 70% OR ERR = 76%) AND ERL = 20% THEN ' FF Table file not found due to wrong characters
    BEEP
    PRINT
    COLOR 12
    PRINT " The FF Table file has not been found!"
'    COLOR 7    ''''''######	
    PRINT
    COLOR 9
    PRINT " Press any key to continue!";
    COLOR 7
    GOSUB waiting
    CLS
    RESUME FF_Table_filename
END IF
'
IF ERR = 62% AND (ERL = 100 OR ERL = 110 OR ERL = 120 OR ERL = 130) THEN ' FF Table input past end of file.
    BEEP
    PRINT
    COLOR 12
    PRINT " The FF Table file is not in accordance with the right format"
    PRINT " (number of lines and/or content of lines)."
	PRINT
    COLOR 9
'    PRINT " Please close the program window ..."    ''''''######	
    PRINT " Press any key to continue!";             ''''''######	
	COLOR 7
'   END	                        ''''''######
    GOSUB waiting               ''''''######
    CLS                         ''''''######
    RESUME FF_Table_filename    ''''''######
END IF
'
COLOR 12
PRINT "Error"; ERR; "at line"; _ERRORLINE
PRINT
COLOR 9
PRINT " Press any key to close the windows!";
COLOR 7
GOSUB waiting
SYSTEM

