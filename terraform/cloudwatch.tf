resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "Raveen-cloudwatch-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      # ==========================================
      # Title Widget
      # ==========================================
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 1
        properties = {
          markdown = "# 🛒 Ecommerce Platform Monitoring Dashboard\nGlobal overview of microservices, API Gateway, and frontend metrics."
        }
      },
      # ==========================================
      # API Gateway Metrics
      # ==========================================
      {
        type   = "metric"
        x      = 0
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiId", "jw0yvet0t5", { "stat": "Sum" }],
            [".", "4xx", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "5xx", ".", ".", { "stat": "Sum", "color": "#d13212" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "API Gateway: Requests & Errors"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 1
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/ApiGateway", "Latency", "ApiId", "jw0yvet0t5", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "API Gateway: Latency (ms)"
        }
      },
      # ==========================================
      # AWS Cognito & CloudFront Metrics
      # ==========================================
      {
        type   = "metric"
        x      = 0
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Cognito", "SignInSuccesses", "UserPool", "ap-southeast-1_cPDXNClGu", "UserPoolClient", "kubkbo5ehb5850ej5a5g9ilqu", { "stat": "Sum" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Cognito: Successful Sign-Ins"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 7
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/CloudFront", "Requests", "Region", "Global", { "stat": "Sum" }],
            [".", "4xxErrorRate", ".", ".", { "stat": "Average", "color": "#d13212" }],
            [".", "5xxErrorRate", ".", ".", { "stat": "Average", "color": "#d13212" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "us-east-1" # CloudFront metrics are always in us-east-1
          title   = "CloudFront: Global Traffic & Error Rates"
        }
      },
      # ==========================================
      # SNS & SQS Metrics
      # ==========================================
      {
        type   = "metric"
        x      = 0
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/SNS", "NumberOfMessagesPublished", "TopicName", "payment-topic-raveen", { "stat": "Sum" }],
            [".", "NumberOfNotificationsFailed", ".", ".", { "stat": "Sum", "color": "#d13212" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "SNS (Payment): Messages & Failures"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 13
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "Order-update-raveen", { "stat": "Average", "label": "Order Update (Visible)" }],
            [".", "ApproximateNumberOfMessagesNotVisible", ".", ".", { "stat": "Average", "color": "#ff7f0e", "label": "Order Update (Not Visible)" }],
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", "inventory-queue-raveen", { "stat": "Average", "label": "Inventory (Visible)" }],
            [".", "ApproximateNumberOfMessagesNotVisible", ".", ".", { "stat": "Average", "color": "#d13212", "label": "Inventory (Not Visible)" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "SQS: Queue Visibility"
        }
      },
      # ==========================================
      # Lambda Metrics (Separate Widgets per Lambda)
      # ==========================================
      # 1. Product Service
      {
        type   = "metric"
        x      = 0
        y      = 19
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "raveen-product_service", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Product Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 19
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "raveen-product_service", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Product Service (Duration)"
        }
      },
      # 2. Order Service
      {
        type   = "metric"
        x      = 0
        y      = 25
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "raveen-order_service", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Order Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 25
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "raveen-order_service", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Order Service (Duration)"
        }
      },
      # 3. Payment Service
      {
        type   = "metric"
        x      = 0
        y      = 31
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "raveen-payment_service", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Payment Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 31
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "raveen-payment_service", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Payment Service (Duration)"
        }
      },
      # 4. Cart Service
      {
        type   = "metric"
        x      = 0
        y      = 37
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "raveen-cart_service", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Cart Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 37
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "raveen-cart_service", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Cart Service (Duration)"
        }
      },
      # 5. Inventory Service
      {
        type   = "metric"
        x      = 0
        y      = 43
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "Inventory_consumer-raveen", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Inventory Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 43
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "Inventory_consumer-raveen", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Inventory Service (Duration)"
        }
      },
      # 6. Notification Service
      {
        type   = "metric"
        x      = 0
        y      = 49
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "email-consumer-raveen", { "stat": "Sum" }],
            [".", "Errors", ".", ".", { "stat": "Sum", "color": "#d13212" }],
            [".", "Throttles", ".", ".", { "stat": "Sum", "color": "#ff7f0e" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Notification Service (Traffic & Errors)"
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 49
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", "email-consumer-raveen", { "stat": "Average" }]
          ]
          view    = "timeSeries"
          stacked = false
          region  = "ap-southeast-1"
          title   = "Lambda: Notification Service (Duration)"
        }
      }
    ]
  })
}
