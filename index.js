const aws = require("aws-sdk");
const dynamo = new aws.DynamoDB.DocumentClient();
const ses = new aws.SES();
aws.config.update({ region: "us-east-1" });

exports.handler = (event, context, callback) => {
    console.log("Executing lambda function...");
    let message = JSON.parse(event.Records[0].Sns.Message);
    var searchParams = {
        TableName: "csye6225",
        Key: {
            unique: message.to + message.userID + message.answerText
        }
    };
    console.log("Checking if record already present in db");

    dynamo.get(searchParams, function(error, data1) {
        if (error) {
            console.log("Error in get", error);
        } else {
            console.log("Success in get", data1);
            console.log(JSON.stringify(data1));
            let isPresent = false;
            if (data1.Item == null || data1.Item == undefined) {
                isPresent = false;
            } else {
                isPresent = true;
            }
            if (!isPresent) {
                let currentTime = new Date().getTime();
                let ttl = process.env.timeToLive * 60 * 1000;
                let expiry = currentTime + ttl;
                var params = {
                    Item: {
                        id: message.to,
                        ttl: expiry,
                        from: message.from,
                        QuestionID: message.QuestionID,
                        AnswerID: message.AnswerID,
                        URL: message.URL,
                        messageText: message.message,
                        answerText: message.answerText,
                        userID: message.userID,
                        unique: message.to + message.userID + message.answerText
                    },
                    TableName: "csye6225"
                };

                dynamo.put(params, function(error, data) {
                    if (error) {
                        console.log("Error", error);
                    } else {
                        console.log("Success", data);
                        var emailParams = {
                            Destination: {
                                ToAddresses: [
                                    params.Item.id
                                ]
                            },
                            Message: {
                                Body: {
                                    Text: {
                                        Charset: "UTF-8",
                                        Data:`\n`+params.Item.messageText+ `\n`+ params.Item.URL
                                    }
                                },
                                Subject: {
                                    Charset: "UTF-8",
                                    Data: "You have received an activity on your Question"
                                }
                            },
                            Source: params.Item.from
                        };
                        var sendPromise = ses.sendEmail(emailParams).promise();
                        sendPromise
                            .then(function(data2) {
                                console.log(data2);
                            })
                            .catch(function(err) {
                                console.error(err, err.stack);
                            });
                    }
                });
            } else {
                console.log("Item already present!!!");
            }
        }
    });
};