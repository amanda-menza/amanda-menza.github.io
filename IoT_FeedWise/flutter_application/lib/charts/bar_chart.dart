import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // For jsonDecode
import '../models/detection_data.dart';
import 'package:intl/intl.dart';

class BarChartWidget extends StatefulWidget {
  @override
  State<BarChartWidget> createState() => _BarChartWidgetState();
}

class _BarChartWidgetState extends State<BarChartWidget> {
  List<DetectionData> data = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchDetectionData();
  }

  Future<void> fetchDetectionData() async {
    try {
      final response = await http
          .get(Uri.parse('http://54.91.61.116:5000/get_detection_data'));

      if (response.statusCode == 200) {
        final dynamic jsonResponse = json.decode(response.body);
        List<dynamic> detectionList;

        if (jsonResponse is List) {
          detectionList = jsonResponse;
        } else if (jsonResponse is Map<String, dynamic>) {
          detectionList = [jsonResponse];
        } else {
          throw Exception('Unexpected response format');
        }

        data = DetectionData.listFromJson(detectionList);

        setState(() {
          isLoading = false;
        });
      } else {
        throw Exception('Failed to load detection data');
      }
    } catch (e) {
      print(e);
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }
    if (data.isEmpty) {
      return Center(child: Text('No data available')); // Handle empty data case
    }

    return Column(
      children: [
        SizedBox(
          height: 200,
          width: double.infinity, // Set the width for the container
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: 1000,
              child: BarChart(
                BarChartData(
                  titlesData: FlTitlesData(
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value == 0) {
                            return Text('0');
                          } else if (value == 1) {
                            return Text('1');
                          }
                          return Text('');
                        },
                      ),
                    ),
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 30,
                        getTitlesWidget: (value, meta) {
                          final index = value.toInt();
                          if (index >= 0 && index < data.length) {
                            return Text(
                              "${data[index].timestamp.hour}:${data[index].timestamp.minute.toString().padLeft(2, '0')}",
                              style: TextStyle(fontSize: 10),
                            );
                          }
                          return Text('');
                        },
                      ),
                    ),
                  ),
                  borderData: FlBorderData(show: true),
                  barGroups: data.asMap().entries.map(
                    (MapEntry<int, DetectionData> entry) {
                      int index = entry.key;
                      DetectionData model = entry.value;
                      return BarChartGroupData(
                        x: index,
                        barRods: [
                          BarChartRodData(
                            toY: model.detected.toDouble(),
                            color: theme.colorScheme.inversePrimary,
                            width: 10,
                            borderRadius: BorderRadius.circular(2),
                          ),
                          BarChartRodData(
                            toY: model.dispersed.toDouble(),
                            color: theme.colorScheme.primary,
                            width: 10,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ],
                      );
                    },
                  ).toList(),
                  gridData: FlGridData(show: true),
                  barTouchData: BarTouchData(
                    touchTooltipData: BarTouchTooltipData(
                      fitInsideHorizontally: true,
                      fitInsideVertically: true,
                      getTooltipColor: (touchedSpot) =>
                          theme.colorScheme.primary,
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        final label = rodIndex == 0 ? 'Detected' : 'Dispensed';
                        return BarTooltipItem(
                          '$label: ${rod.toY.toInt()}\nTime: ${DateFormat('hh:mm a').format(data[group.x.toInt()].timestamp)}',
                          TextStyle(color: theme.colorScheme.onPrimary),
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            LegendItem(
                color: theme.colorScheme.inversePrimary, text: 'Detected'),
            SizedBox(width: 20),
            LegendItem(color: theme.colorScheme.primary, text: 'Dispensed'),
          ],
        ),
      ],
    );
  }
}

class LegendItem extends StatelessWidget {
  final Color color;
  final String text;

  const LegendItem({required this.color, required this.text});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 12,
          height: 12,
          color: color,
        ),
        SizedBox(width: 5),
        Text(text),
      ],
    );
  }
}
