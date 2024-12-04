import 'package:flutter/material.dart';
import '../charts/bar_chart.dart'; // Adjust path based on your structure
import '../charts/line_chart.dart';
import 'package:flutter/material.dart';
import 'package:cupertino_setting_control/cupertino_setting_control.dart';
import 'package:http/http.dart' as http;
import 'dart:developer';
import 'dart:convert';
import 'package:provider/provider.dart';
import '../models/SettingsModel.dart';

class DataPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Today\'s Trends'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            SizedBox(height: 30),
            Center(
              child: Text(
                'Detection and Dispension', // Your chart title
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
            BarChartWidget(),
            SizedBox(height: 20),
            Center(
              child: Text(
                'Bowl Weight', // Your chart title
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
            LineChartWidget(),
            SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: () {
                  sendDisperseDataToESP();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue, // Button background color
                  foregroundColor: Colors.white, // Button text color
                ),
                child: Text("Force Food Dispense"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> sendDisperseDataToESP() async {
    try {
      final response = await http.post(
        Uri.parse('http://192.168.86.30/force_dispense'), //192.168.86.66
        body: jsonEncode({'dispense': 1}),
      );
      log("this is the dispense response: $response");
    } catch (e) {
      log("", error: e, name: "error");
    }
  }
}
