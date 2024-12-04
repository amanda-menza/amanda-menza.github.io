#include <stdio.h>
#include <freertos/FreeRTOS.h>
#include <freertos/task.h>
#include <driver/gpio.h>
#include <esp_log.h>
#include "rc522.h"
#include "driver/rc522_spi.h"
#include "rc522_picc.h"
#include "esp_timer.h"
#include <inttypes.h>
#include "hx711.h"
#include <rom/ets_sys.h>
#include "esp_http_client.h"
#include "cJSON.h"
#include <sys/param.h>
#include "freertos/event_groups.h"
#include "esp_wifi.h"
#include "esp_log.h"
#include "esp_event.h"
#include "nvs_flash.h"
#include "regex.h"
#include "ping/ping_sock.h"
#include "lwip/err.h"
#include "lwip/sys.h"
#include "lwip/inet.h"
#include "lwip/netdb.h"
#include "lwip/sockets.h"

#include "esp_http_client.h"
#include "cJSON.h"
#include <sys/param.h>
#include "esp_tls.h"
#include "esp_http_server.h"
#include "servo_motor.h"
#include "servo_motor360.h"

static const char *TAG2 = "hx711-example";
static const char *TAG1 = "rc522";
static const char *TAG = "http";
#define ESP_WIFI_SSID "DukeVisitor"
#define ESP_WIFI_PASS ""
#define WIFI_CONNECTED_BIT BIT0
#define WIFI_FAIL_BIT      BIT1
#define ESP_WIFI_SCAN_AUTH_MODE_THRESHOLD  WIFI_AUTH_OPEN
#define ESP_MAXIMUM_RETRY 2
//ESP URI 192.168.86.66

#define MAX_HTTP_RECV_BUFFER 512
#define MAX_HTTP_OUTPUT_BUFFER 2048
#define DETECTION_URL "http://54.91.61.116:5000/upload_detection_data"
#define WEIGHT_URL "http://54.91.61.116:5000/upload_weight"
#define QUERY ""

//ALL WHITE WIRES ON PROTOBOARD
#define RC522_SPI_BUS_GPIO_MISO    GPIO_NUM_37 // protoboard pin 5
#define RC522_SPI_BUS_GPIO_MOSI    GPIO_NUM_33 // protoboard pin 6
#define RC522_SPI_BUS_GPIO_SCLK    GPIO_NUM_36 // protoboard pin 7
#define RC522_SPI_SCANNER_GPIO_SDA GPIO_NUM_26 // protoboard pin 8
#define RC522_SCANNER_GPIO_RST     GPIO_NUM_35  // protoboard pin 4


#define CONFIG_EXAMPLE_AVG_TIMES 5

 
#define DT_PIN GPIO_NUM_19  // BLUE WIRE: pin 16 on protoboard
#define SCK_PIN GPIO_NUM_20 // YELLOW WIRE: pin 15 on protoboard

#define DOOR_SERVO_PIN       GPIO_NUM_7//GREEN WIRE
#define CHANNEL_1      LEDC_CHANNEL_0  // Channel for the first servo
#define CHANNEL_2      LEDC_CHANNEL_1  // Channel for the second servo
#define WHEEL_SERVO_PIN       GPIO_NUM_6 //PURPLE WIRE



#define WEIGHT_THRESHOLD 35000

int detected=0;
int dispersed=0;
int WEIGHT_DELAY = 1;
int MOTOR_DELAY; 
int HOUR_DELAY=2;

//#define TIME_DELAY HOUR_DELAY*3600000000
int TIME_DELAY;

static EventGroupHandle_t s_wifi_event_group;
static int s_retry_num = 0;
int64_t last_read_time;
hx711_t dev;



static void event_handler(void* arg, esp_event_base_t event_base,
                                int32_t event_id, void* event_data)
{
    if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_START) {
        esp_wifi_connect();
    } else if (event_base == WIFI_EVENT && event_id == WIFI_EVENT_STA_DISCONNECTED) {
        if (s_retry_num < ESP_MAXIMUM_RETRY) {
            esp_wifi_connect();
            s_retry_num++;
            ESP_LOGI(TAG, "retry to connect to the AP");
        } else {
            xEventGroupSetBits(s_wifi_event_group, WIFI_FAIL_BIT);
        }
        ESP_LOGI(TAG,"connect to the AP fail");
    } else if (event_base == IP_EVENT && event_id == IP_EVENT_STA_GOT_IP) {
        ip_event_got_ip_t* event = (ip_event_got_ip_t*) event_data;
        ESP_LOGI(TAG, "got ip:" IPSTR, IP2STR(&event->ip_info.ip));
        s_retry_num = 0;
        xEventGroupSetBits(s_wifi_event_group, WIFI_CONNECTED_BIT);
    }
}

void wifi_init_sta(void)
{
    s_wifi_event_group = xEventGroupCreate();

    ESP_ERROR_CHECK(esp_netif_init());

    ESP_ERROR_CHECK(esp_event_loop_create_default());
    esp_netif_create_default_wifi_sta();

    wifi_init_config_t cfg = WIFI_INIT_CONFIG_DEFAULT();
    ESP_ERROR_CHECK(esp_wifi_init(&cfg));

    esp_event_handler_instance_t instance_any_id;
    esp_event_handler_instance_t instance_got_ip;
    ESP_ERROR_CHECK(esp_event_handler_instance_register(WIFI_EVENT,
                                                        ESP_EVENT_ANY_ID,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_any_id));
    ESP_ERROR_CHECK(esp_event_handler_instance_register(IP_EVENT,
                                                        IP_EVENT_STA_GOT_IP,
                                                        &event_handler,
                                                        NULL,
                                                        &instance_got_ip));

    wifi_config_t wifi_config = {
        .sta = {
            .ssid = ESP_WIFI_SSID,
            .password = ESP_WIFI_PASS,
        },
    };
    ESP_ERROR_CHECK(esp_wifi_set_mode(WIFI_MODE_STA) );
    ESP_ERROR_CHECK(esp_wifi_set_config(WIFI_IF_STA, &wifi_config) );
    ESP_ERROR_CHECK(esp_wifi_start() );

    ESP_LOGI(TAG, "wifi_init_sta finished.");

    EventBits_t bits = xEventGroupWaitBits(s_wifi_event_group,
            WIFI_CONNECTED_BIT | WIFI_FAIL_BIT,
            pdFALSE,
            pdFALSE,
            portMAX_DELAY);

    if (bits & WIFI_CONNECTED_BIT) {
        ESP_LOGI(TAG, "connected to ap SSID:%s password:%s",
                 ESP_WIFI_SSID, ESP_WIFI_PASS);
    } else if (bits & WIFI_FAIL_BIT) {
        ESP_LOGI(TAG, "Failed to connect to SSID:%s, password:%s",
                 ESP_WIFI_SSID, ESP_WIFI_PASS);
    } else {
        ESP_LOGE(TAG, "UNEXPECTED EVENT");
    }
}

void send_detection_data_to_server(int detected, int dispersed) {
    // Create JSON object
    cJSON *root = cJSON_CreateObject();
    cJSON_AddNumberToObject(root, "detected", detected);
    cJSON_AddNumberToObject(root, "dispersed", dispersed);

    // Convert the JSON object to a string
    char *post_data = cJSON_PrintUnformatted(root);

    // Initialize HTTP client
    esp_http_client_config_t config = {
        .url = DETECTION_URL,
        .method = HTTP_METHOD_POST,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);

    // Set the POST data
    esp_http_client_set_post_field(client, post_data, strlen(post_data));

    // Set headers (Content-Type: application/json)
    esp_http_client_set_header(client, "Content-Type", "application/json");

    // Perform the POST request
    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP POST Status, content_length");
    } else {
        ESP_LOGE(TAG, "HTTP POST request failed");
    }

    // Clean up
    esp_http_client_cleanup(client);
    cJSON_Delete(root);   // Free the JSON object
    free(post_data);      // Free the JSON string
}

void send_weight_data_to_server(int32_t weight) {
    // Create JSON object
    cJSON *root = cJSON_CreateObject();
    cJSON_AddNumberToObject(root, "weight", weight);

    // Convert the JSON object to a string
    char *post_data = cJSON_PrintUnformatted(root);

    // Initialize HTTP client
    esp_http_client_config_t config = {
        .url = WEIGHT_URL,
        .method = HTTP_METHOD_POST,
    };
    esp_http_client_handle_t client = esp_http_client_init(&config);

    // Set the POST data
    esp_http_client_set_post_field(client, post_data, strlen(post_data));

    // Set headers (Content-Type: application/json)
    esp_http_client_set_header(client, "Content-Type", "application/json");

    // Perform the POST request
    esp_err_t err = esp_http_client_perform(client);
    if (err == ESP_OK) {
        ESP_LOGI(TAG, "HTTP POST Status, content_length");
    } else {
        ESP_LOGE(TAG, "HTTP POST request failed");
    }

    // Clean up
    esp_http_client_cleanup(client);
    cJSON_Delete(root);   // Free the JSON object
    free(post_data);      // Free the JSON string
}



static rc522_spi_config_t driver_config = {
    .host_id = SPI3_HOST,
    .bus_config = &(spi_bus_config_t){
        .miso_io_num = RC522_SPI_BUS_GPIO_MISO,
        .mosi_io_num = RC522_SPI_BUS_GPIO_MOSI,
        .sclk_io_num = RC522_SPI_BUS_GPIO_SCLK,
    },
    .dev_config = {
        .spics_io_num = RC522_SPI_SCANNER_GPIO_SDA,
    },
    .rst_io_num = RC522_SCANNER_GPIO_RST,
};

static rc522_driver_handle_t driver;
static rc522_handle_t scanner;

void setup_hx711_pins() {
    // Configure SCK as an output pin
    gpio_config_t io_conf = {
        .pin_bit_mask = (1ULL << SCK_PIN),
        .mode = GPIO_MODE_OUTPUT,
        .pull_down_en = GPIO_PULLDOWN_DISABLE,
        .pull_up_en = GPIO_PULLUP_DISABLE,
        .intr_type = GPIO_INTR_DISABLE
    };
    gpio_config(&io_conf);

    // Configure DT as an input pin
    io_conf.pin_bit_mask = (1ULL << DT_PIN);
    io_conf.mode = GPIO_MODE_INPUT;
    gpio_config(&io_conf);
}

int32_t checkWeight() {
    esp_err_t r = hx711_wait(&dev, 500);
    if (r != ESP_OK)
    {
        ESP_LOGE(TAG2, "Device not found: %d (%s)\n", r, esp_err_to_name(r));
    }
    int32_t data;
    hx711_read_data(&dev, &data);
    if (r != ESP_OK)
    {
        ESP_LOGE(TAG2, "Could not read data: %d (%s)\n", r, esp_err_to_name(r));
    }
    ESP_LOGI(TAG2, "Raw data: %" PRIi32, data);
    // send_weight_data_to_server(data);
    return data;
}



bool checkValidConditions() {
    bool ans;
    int32_t data = checkWeight();
    if (esp_timer_get_time() - TIME_DELAY < last_read_time) {
        send_weight_data_to_server(data);
        ans= false;
    }
    else{
        last_read_time = esp_timer_get_time();
        ans = data < WEIGHT_THRESHOLD;
    }
    return ans;
}

static void on_picc_state_changed(void *arg, esp_event_base_t base, int32_t event_id, void *data)
{
    rc522_picc_state_changed_event_t *event = (rc522_picc_state_changed_event_t *)data;
    rc522_picc_t *picc = event->picc;

    if (picc->state == RC522_PICC_STATE_ACTIVE) {
        ESP_LOGI(TAG1, "Card has been found");
        rc522_picc_print(picc);
        detected=1;
        if(checkValidConditions())
        {
            ESP_LOGI(TAG1, "valid condition");
            dispersed=1;
            gpio_set_level(MOTOR_GPIO,1);
            set_servo_angle(90,CHANNEL_1); // Move to 0 degrees
            ESP_LOGI(TAG, "opening door, moving to 90 degrees");
            rotate_servo_backward(CHANNEL_2);     // Rotate in one direction
            ESP_LOGI(TAG, "rotating forward");
            vTaskDelay(MOTOR_DELAY / portTICK_PERIOD_MS);
            set_servo_angle(0,CHANNEL_1); // Move to 0 degrees
            stop_servo(CHANNEL_2);
        }
        send_detection_data_to_server(detected, dispersed);
        int32_t data = checkWeight();
        send_weight_data_to_server(data);


        vTaskDelay(1000 / portTICK_PERIOD_MS);

    }
    else if (picc->state == RC522_PICC_STATE_IDLE && event->old_state >= RC522_PICC_STATE_ACTIVE) {
        detected=0;
        dispersed=0;
        ESP_LOGI(TAG1, "Card has been removed");
    }
}
esp_err_t handle_update_time(httpd_req_t *req) {
    char content[100];
    int ret = httpd_req_recv(req, content, req->content_len);
    if (ret <= 0) {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    content[ret] = '\0'; // Null terminate the received string
    ESP_LOGI(TAG, "Received message: %s", content);
    // Parse JSON content to extract the time value
    cJSON *root = cJSON_Parse(content);
    if (root == NULL) {
        ESP_LOGI(TAG, "Failed to parse JSON");
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    // Extract "time" from JSON
    cJSON *time_item = cJSON_GetObjectItem(root, "time");
    if (cJSON_IsNumber(time_item)) {
        HOUR_DELAY = time_item->valueint;
        ESP_LOGI(TAG, "Time updated to: %d hours", HOUR_DELAY);
    }
    else{
        ESP_LOGI(TAG, "extracted");

    }
    ESP_LOGI(TAG, "check time update %d hours", HOUR_DELAY);
    TIME_DELAY =HOUR_DELAY*5000000;
    // Free the JSON object
    cJSON_Delete(root);

    httpd_resp_send(req, "Time updated", HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}


//@TODO: change weight value to have a motor delay corresponding mapping
esp_err_t handle_update_weight(httpd_req_t *req) {
    char content[100];
    int ret = httpd_req_recv(req, content, req->content_len);
    if (ret <= 0) {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    content[ret] = '\0'; // Null terminate the received string
    ESP_LOGI(TAG, "Received message: %s", content);
    // Parse JSON content to extract the weight value
    cJSON *root = cJSON_Parse(content);
    if (root == NULL) {
        ESP_LOGI(TAG, "Failed to parse JSON");
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    // Extract "weight" from JSON
    cJSON *weight_item = cJSON_GetObjectItem(root, "weight");
    if (cJSON_IsNumber(weight_item)) {
        WEIGHT_DELAY = weight_item->valueint;
        ESP_LOGI(TAG, "Weight updated to: %d", MOTOR_DELAY);
    }
    MOTOR_DELAY= WEIGHT_DELAY*4000; 

    // Free the JSON object
    cJSON_Delete(root);

    httpd_resp_send(req, "Weight updated", HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

esp_err_t handle_force_dispense(httpd_req_t *req) {
    char content[100];
    int ret = httpd_req_recv(req, content, req->content_len);
    if (ret <= 0) {
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    content[ret] = '\0'; // Null terminate the received string
    ESP_LOGI(TAG, "Received message: %s", content);
    // Parse JSON content to extract the time value
    cJSON *root = cJSON_Parse(content);
    if (root == NULL) {
        ESP_LOGI(TAG, "Failed to parse JSON");
        httpd_resp_send_404(req);
        return ESP_FAIL;
    }

    // Extract "time" from JSON
    cJSON *dispense_item = cJSON_GetObjectItem(root, "dispense");
    if (cJSON_IsNumber(dispense_item)) {
        dispersed = dispense_item->valueint;
        ESP_LOGI(TAG, "dispersed updated to: %d ",dispersed);
    }
    else{
        ESP_LOGI(TAG, "extracted");

    }
    gpio_set_level(MOTOR_GPIO,1);
    set_servo_angle(90,CHANNEL_1); // Move to 0 degrees
    ESP_LOGI(TAG, "opening door, moving to 90 degrees");
    rotate_servo_backward(CHANNEL_2);     // Rotate in one direction
    ESP_LOGI(TAG, "rotating forward");
    vTaskDelay(MOTOR_DELAY / portTICK_PERIOD_MS);
    set_servo_angle(0,CHANNEL_1); // Move to 0 degrees
    stop_servo(CHANNEL_2);
    send_detection_data_to_server(detected, dispersed);
    int32_t data = checkWeight();
    send_weight_data_to_server(data);
    
    // Free the JSON object
    cJSON_Delete(root);

    httpd_resp_send(req, "Time updated", HTTPD_RESP_USE_STRLEN);
    return ESP_OK;
}

// Initialize HTTP server
void start_http_server() {
    httpd_handle_t server = NULL;
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();

    // Initialize the server
    ESP_ERROR_CHECK(httpd_start(&server, &config));

    // Define URI handlers
    httpd_uri_t time_uri = {
        .uri = "/update_time",
        .method = HTTP_POST,
        .handler = handle_update_time,
        .user_ctx = NULL
    };
    httpd_register_uri_handler(server, &time_uri);

    httpd_uri_t weight_uri = {
        .uri = "/update_weight",
        .method = HTTP_POST,
        .handler = handle_update_weight,
        .user_ctx = NULL
    };
    httpd_register_uri_handler(server, &weight_uri);

    httpd_uri_t dispense_uri = {
        .uri = "/force_dispense",
        .method = HTTP_POST,
        .handler = handle_force_dispense,
        .user_ctx = NULL
    };
    httpd_register_uri_handler(server, &dispense_uri);


}


void app_main()
{
    setup_pwm(DOOR_SERVO_PIN,CHANNEL_1);
    setup_pwm360(WHEEL_SERVO_PIN, CHANNEL_2);
    

    rc522_config_t scanner_config = {
        .driver = driver,
    };
    // // Initialize NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK( ret );
    
    wifi_init_sta();
    start_http_server();
    vTaskDelay(2000 / portTICK_PERIOD_MS);
    
    dev.dout = DT_PIN;
    dev.pd_sck = SCK_PIN;
    dev.gain = HX711_GAIN_A_64; // Set gain

    // initialize device
    esp_err_t init_res = hx711_init(&dev);
    if (init_res != ESP_OK) {
        ESP_LOGE(TAG2, "HX711 initialization failed: %d (%s)", init_res, esp_err_to_name(init_res));
    }
    else{
        ESP_LOGI(TAG2, "HX711 initialization succeed: %d", init_res);
    }


    rc522_create(&scanner_config, &scanner);
    rc522_register_events(scanner, RC522_EVENT_PICC_STATE_CHANGED, on_picc_state_changed, NULL);
    int result = rc522_start(scanner);

    if (result != 0) { // Assuming 0 indicates success
        fprintf(stderr, "Error: Failed to start RC522 scanner. Error code: %d\n", result);
    } else {
        printf("RC522 scanner started successfully.\n");
    }
    last_read_time = 0;
    MOTOR_DELAY= WEIGHT_DELAY*4000; 
    TIME_DELAY =HOUR_DELAY*5000000;
    
    
 }
