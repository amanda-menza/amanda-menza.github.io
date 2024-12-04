import 'package:flutter/material.dart';
import 'package:cupertino_setting_control/cupertino_setting_control.dart';
import 'package:http/http.dart' as http;
import 'dart:developer';
import 'dart:convert';
import 'package:provider/provider.dart';
import '../models/SettingsModel.dart';

class SettingsPage extends StatefulWidget {
  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late SettingsModel settings;

  @override
  void initState() {
    super.initState();
    // Initialize settings to listen for changes
    settings = Provider.of<SettingsModel>(context, listen: false);
  }

  //bool _titleOnTop = false;

  @override
  Widget build(BuildContext context) {
    final settings = Provider.of<SettingsModel>(context);
    final theme = Theme.of(context);
    final userSpecifications = Material(
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
              padding: EdgeInsets.fromLTRB(25.0, 5.0, 25.0, 5.0),
              child: Text('User Specifications',
                  style: TextStyle(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 15.0,
                  ))),
          SettingRow(
            rowData: SettingsDropDownConfig(
                title: 'Min Feeding Interval(hours)',
                initialKey: settings.searchTimeResult,
                choices: {
                  '1': '1',
                  '2': '2',
                  '3': '3',
                  '4': '4',
                  '5': '5',
                  '6': '6',
                  '7': '7',
                  '8': '8',
                  '9': '9',
                  '10': '10',
                  '11': '11',
                  '12': '12',
                },
                onDropdownFinished: () => {}),
            onSettingDataRowChange: onSearchTimeChange,
            config: SettingsRowConfiguration(
                showAsTextField: false,
                showTitleLeft: true,
                showAsSingleSetting: false),
          ),
        ],
      ),
    );

    final privacySettings = Material(
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
              padding: EdgeInsets.fromLTRB(25.0, 5.0, 25.0, 5.0),
              child: Text(
                'Privacy Settings',
                style: TextStyle(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 15.0,
                ),
              )),
          SettingRow(
            config: SettingsRowConfiguration(showTitleLeft: true),
            rowData: SettingsYesNoConfig(
                initialValue: settings.notificationResult,
                title: 'Allow Notification'),
            onSettingDataRowChange: onNotificationSettingChange,
          ),
        ],
      ),
    );

    final profileSettingsTile = Material(
      color: Colors.transparent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Padding(
              padding: EdgeInsets.fromLTRB(25.0, 5.0, 25.0, 5.0),
              child: Text(
                'Profile',
                style: TextStyle(
                  color: theme.colorScheme.primary,
                  fontSize: 15.0,
                  fontWeight: FontWeight.bold,
                ),
              )),
          SettingRow(
            rowData: SettingsTextFieldConfig(
              title: 'Pet Name',
              initialValue: 'Name',
            ),
            onSettingDataRowChange: (String resultVal) {},
            config: SettingsRowConfiguration(
                showAsTextField: false,
                showTitleLeft: true,
                showAsSingleSetting: false),
          ),
          SettingRow(
            rowData: SettingsDropDownConfig(
                title: 'Weight',
                initialKey: settings.searchWeightResult,
                choices: {
                  '1': '2-22lbs',
                  '2': '23-57lbs',
                  '3': '58-99lbs',
                  '4': '100+lbs'
                },
                onDropdownFinished: () => {}),
            onSettingDataRowChange: onSearchWeightChange,
            config: SettingsRowConfiguration(
                showAsTextField: false,
                showTitleLeft: true,
                showAsSingleSetting: false),
          ),
          SettingRow(
            rowData: SettingsDropDownConfig(
                title: 'Age(years)',
                initialKey: settings.searchAgeResult,
                choices: {
                  '0': '0',
                  '1': '1',
                  '2': '2',
                  '3': '3',
                  '4': '4',
                  '5': '5',
                  '6': '6',
                  '7': '7',
                  '8': '8',
                  '9': '9',
                  '10': '10',
                  '11': '11',
                  '12': '12',
                  '13': '13',
                  '14': '14',
                  '15': '15',
                  '16': '16',
                  '17': '17',
                  '18': '18',
                  '19': '19',
                  '20': '20'
                },
                onDropdownFinished: () => {}),
            onSettingDataRowChange: onSearchAgeChange,
            config: SettingsRowConfiguration(
                showAsTextField: false,
                showTitleLeft: true,
                showAsSingleSetting: false),
          ),
        ],
      ),
    );

    final List<Widget> widgetList = [
      profileSettingsTile,
      const SizedBox(height: 15.0),
      userSpecifications,
      const SizedBox(height: 15.0),
      privacySettings,
      const SizedBox(height: 15.0),
    ];

    return Scaffold(
      body: Padding(
          padding: const EdgeInsets.fromLTRB(0, 50, 0, 0),
          child: ListView(
              children: widgetList,
              physics: const AlwaysScrollableScrollPhysics())),
    );
  }

  void onNotificationSettingChange(bool data) {
    settings.updateNotification(data);
  }

  void onSearchWeightChange(String data) {
    settings.updateWeight(data);
    sendWeightDataToESP();
  }

  void onSearchAgeChange(String data) {
    settings.updateAge(data);
  }

  void onSearchTimeChange(String data) {
    settings.updateTime(data);
    sendTimeDataToESP();
  }

  Future<void> sendTimeDataToESP() async {
    try {
      final timeValue = int.tryParse(settings.searchTimeResult) ?? 0;
      final response = await http.post(
        Uri.parse('http://192.168.86.30/update_time'),
        body: jsonEncode({'time': timeValue}),
      );
      log("this is the time response: ${response.statusCode}");
    } catch (e) {
      log("", error: e, name: "error");
    }
  }

  Future<void> sendWeightDataToESP() async {
    try {
      final weightValue = int.tryParse(settings.searchWeightResult) ?? 0;
      final response = await http.post(
        Uri.parse('http://192.168.86.30/update_weight'), //192.168.86.66
        body: jsonEncode({'weight': weightValue}),
      );
      log("this is the weight response: $response");
    } catch (e) {
      log("", error: e, name: "error");
    }
  }
}
