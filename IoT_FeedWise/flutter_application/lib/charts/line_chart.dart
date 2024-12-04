import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:http/http.dart' as http;
import 'dart:convert'; // For jsonDecode
import '../models/weight_data.dart';
import 'package:intl/intl.dart'; // Make sure intl is installed

class LineChartWidget extends StatefulWidget {
  @override
  State<LineChartWidget> createState() => _LineChartWidgetState();
}

class _LineChartWidgetState extends State<LineChartWidget> {
  List<WeightData> data = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchWeightData();
  }

  Future<void> fetchWeightData() async {
    try {
      final response =
          await http.get(Uri.parse('http://54.91.61.116:5000/get_weight'));

      if (response.statusCode == 200) {
        final dynamic jsonResponse = json.decode(response.body);
        List<dynamic> detectionList = [];

        // Check if the response contains a 'data' key
        if (jsonResponse is Map<String, dynamic> &&
            jsonResponse.containsKey('data')) {
          detectionList = jsonResponse['data'];
        } else {
          throw Exception('Unexpected response format');
        }

        // Convert the detection list to WeightData objects
        data = WeightData.listFromJson(detectionList);

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
      return Center(
          child: CircularProgressIndicator()); // Show loading indicator
    }
    if (data.isEmpty) {
      return Center(child: Text('No data available')); // Handle empty data case
    }

    final Set<double> dataTimestamps =
        data.map((e) => e.timestamp.millisecondsSinceEpoch.toDouble()).toSet();
    return Column(
      children: [
        SizedBox(
          height: 200,
          width: double.infinity, // Set the width for the container
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: SizedBox(
              width: 350, // Dynamically set width based on data length
              child: LineChart(
                LineChartData(
                  gridData: const FlGridData(show: true),
                  titlesData: FlTitlesData(
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, _) {
                          if (value.isNaN || value.isInfinite) {
                            print('Invalid value encountered: $value');
                            return const SizedBox.shrink();
                          }
                          if (dataTimestamps.contains(value)) {
                            final date = DateTime.fromMillisecondsSinceEpoch(
                                value.toInt());
                            return Text(
                              DateFormat('HH:mm')
                                  .format(date), // Format as needed
                              style: TextStyle(fontSize: 10),
                            );
                          } else {
                            // Return an empty widget if the timestamp is not in data
                            return const SizedBox.shrink();
                          }
                        },
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, _) => Text(
                            (value / 15500).toStringAsFixed(2),
                            style: TextStyle(fontSize: 8)),
                      ),
                    ),
                    topTitles: AxisTitles(
                      sideTitles:
                          SideTitles(showTitles: false), // Hide top titles
                    ),
                    rightTitles: AxisTitles(
                      sideTitles:
                          SideTitles(showTitles: false), // Hide right titles
                    ),
                  ),
                  borderData: FlBorderData(show: true),
                  lineBarsData: [
                    LineChartBarData(
                      spots: data.map((weightData) {
                        return FlSpot(
                          weightData.timestamp.millisecondsSinceEpoch
                              .toDouble(),
                          weightData.weight,
                        );
                      }).toList(),
                      isCurved: true,
                      color: theme.colorScheme.primary,
                      barWidth: 4,
                      belowBarData: BarAreaData(show: false),
                    ),
                  ],
                  lineTouchData: LineTouchData(
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipColor: (touchedSpot) =>
                          theme.colorScheme.primary,
                      tooltipRoundedRadius: 8,
                      fitInsideHorizontally: true,
                      fitInsideVertically: true,
                      getTooltipItems: (touchedSpots) {
                        return touchedSpots.map((touchedSpot) {
                          // Extract data
                          final timestamp = touchedSpot.x
                              .toInt(); // X-axis value (milliseconds since epoch)
                          final weight = touchedSpot.y; // Y-axis value (weight)

                          // Convert timestamp to a formatted date
                          final date =
                              DateTime.fromMillisecondsSinceEpoch(timestamp);
                          //final timeString = DateFormat('HH:mm').format(date);
                          final timeString = DateFormat('hh:mm a').format(date);

                          return LineTooltipItem(
                            'Weight: ${weight.toStringAsFixed(1)}\nTime: $timeString',
                            TextStyle(
                              color: Theme.of(context).colorScheme.onPrimary,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          );
                        }).toList();
                      },
                    ),
                    touchCallback:
                        (FlTouchEvent event, LineTouchResponse? response) {
                      if (!event.isInterestedForInteractions ||
                          response == null) {
                        return;
                      }
                      // Handle touch events here if needed
                    },
                    handleBuiltInTouches: true,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
