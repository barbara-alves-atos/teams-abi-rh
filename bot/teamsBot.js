const axios = require("axios");
const { TeamsActivityHandler, CardFactory, TurnContext, ActivityTypes, TeamsInfo, ActionTypes } = require("botbuilder");
const rawWelcomeCard = require("./adaptiveCards/welcome.json");
const cardTools = require("@microsoft/adaptivecards-tools");

//imports custom projeto
const TeamsUser = require("./teamsUser");
const SendFiles = require("./sendFiles");

class TeamsBot extends TeamsActivityHandler {
  constructor(conversationReferences) {
    super();

    // Dependency injected dictionary for storing ConversationReference objects used in NotifyController to proactively message users
    this.conversationReferences = conversationReferences;

    const api = axios.create({
      baseURL: 'http://127.0.0.1:8000/'
    });

    this.onConversationUpdate(async (context, next) => {
      this.addConversationReference(context.activity);
      await next();
    });

    this.onMessage(async (context, next) => {
      this.addConversationReference(context.activity);

      console.log("Running with Message Activity.");

      //envia o status de typing para a interface do teams
      context.sendActivity({ type: ActivityTypes.Typing });

      let txtFromTeams = context.activity.text;

      //coleta as informações do usuário no Teams
      let teamsUser = new TeamsUser(
        context.activity.from.id,
        context.activity.from.name,
        await (await TeamsInfo.getMember(context, context.activity.from.id)).email
      );

      const removedMentionText = TurnContext.removeRecipientMention(context.activity);
      if (removedMentionText) {
        // Remove the line break
        txtFromTeams = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      var file = context.activity.attachments;
      //********************
      //Muitas vezes o bot se confunde e interpreta um arquivo html como um 
      //arquivo de anexo, esse if faz esse teste, se o arquivo for tipo html,
      //consideramos ele como null.
      //********************
      try {
        if (file && file[0]?.contentType == "text/html") {
          file = null;
        }
      } catch (error) {
        console.log(error)
      }

      if (file) {
        SendFiles.send(context, file, teamsUser);
      } else {
        //Faz o request para o backend para receber a resposta do QnA.
        var response = await api.post(
          'teams-get-answers/',
          {
            "data": txtFromTeams,
            "session": teamsUser.userId,
            "nameUser": teamsUser.userName,
            "email": teamsUser.userEmail
          },
          {
            headers: {
              apiKey: 'cGFzc3dvcmQgZGEgYXBpIGRvIHRlYW1zIGRhIGJyYXNpbHByZXY='
            }
          }
        );

        var txtFromQna = response.data;

        //separa botões do restante do texto e guarda as informações.
        let [text, buttonText] = txtFromQna.split('\n\n\n\n\n');
        let buttons = [];
        if (buttonText) {
          let splitedButtonsText = buttonText.split('\n');
          for (let splitedButtonText of splitedButtonsText) {
            const [displayOrder, qnaId, displayText] = splitedButtonText.split(':')
            if (displayText) {
              buttons.push({ type: ActionTypes.ImBack, title: displayText, value: displayText })

            }

          }
        }

        // existem botões? (envia os botões como era no doc 'dialogflow_integration_buttons')
        if (buttons) {
          if (buttons.length) {
            await context.sendActivity({
              attachments: [CardFactory.heroCard('', undefined,
                buttons, { text: text })]
            });
          } else {
            await context.sendActivity(
              txtFromQna
            );
          }
        }
        // By calling next() you ensure that the next BotHandler is run.
      }
      await next();
    });

    // Listen to MembersAdded event, view https://docs.microsoft.com/en-us/microsoftteams/platform/resources/bot-v3/bots-notifications for more events
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      this.addConversationReference(context.activity);
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          const card = cardTools.AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({ attachments: [CardFactory.adaptiveCard(card)] });
          break;
        }
      }
      await next();
    });
  }

  addConversationReference(activity) {
    const conversationReference = TurnContext.getConversationReference(activity);
    this.conversationReferences[conversationReference.conversation.id] = conversationReference;
  }

}

module.exports.TeamsBot = TeamsBot;
