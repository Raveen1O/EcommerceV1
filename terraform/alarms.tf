data "aws_sns_topic" "cloudwatch_alerts" {
  name = "lumina-cloudwatch-alerts"
}

resource "aws_sns_topic_subscription" "email_subscription" {
  topic_arn = data.aws_sns_topic.cloudwatch_alerts.arn
  protocol  = "email"
  endpoint  = "raveenpbksr2@gmail.com"
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_5xx" {
  alarm_name          = "Lumina-api-gateway-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Sum"
  threshold           = 2
  alarm_description   = "Detect backend/API failures."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    ApiName = "raveen-api-gateway"
  }
}

resource "aws_cloudwatch_metric_alarm" "api_gateway_latency" {
  alarm_name          = "Lumina-api-gateway-latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "Latency"
  namespace           = "AWS/ApiGateway"
  period              = 60
  statistic           = "Average"
  threshold           = 2000
  alarm_description   = "Detect slow API responses."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    ApiName = "raveen-api-gateway"
  }
}

resource "aws_cloudwatch_metric_alarm" "order_lambda_errors" {
  alarm_name          = "Lumina-order-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Detect unhandled exceptions in the Order service."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    FunctionName = "raveen-order_service"
  }
}

resource "aws_cloudwatch_metric_alarm" "checkout_success_rate" {
  alarm_name          = "lumina-checkout-success-rate"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CheckoutSuccessRate"
  namespace           = "Lumina/BusinessMetrics"
  period              = 60
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Detect abnormal checkout/payment failures."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    FunctionName = "raveen-payment_service"
  }
}

resource "aws_cloudwatch_metric_alarm" "cart_abandonment_rate" {
  alarm_name          = "lumina-cart-abandonment-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CartAbandonmentRate"
  namespace           = "Lumina/BusinessMetrics"
  period              = 60
  statistic           = "Average"
  threshold           = 40
  alarm_description   = "Detect users abandoning the checkout process."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    FunctionName = "raveen-cart_service"
  }
}

resource "aws_cloudwatch_metric_alarm" "revenue_generated" {
  alarm_name          = "lumina-revenue-kpi"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Revenue"
  namespace           = "Lumina/BusinessMetrics"
  period              = 60
  statistic           = "Sum"
  threshold           = 500
  alarm_description   = "Demonstrate business KPI monitoring (adjust threshold as needed for demos)"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [data.aws_sns_topic.cloudwatch_alerts.arn]

  dimensions = {
    FunctionName = "raveen-order_service"
  }
}
