module.exports = async(interaction)=>{
  const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, Colors } = require("discord.js");
  if(!interaction.isChatInputCommand()) return;
  if(interaction.commandName === "panel"){
    const title = interaction.options.getString("title")||"役職パネル";

    const roles = [
      interaction.options.getRole("role_1"),
      interaction.options.getRole("role_2"),
      interaction.options.getRole("role_3"),
      interaction.options.getRole("role_4"),
      interaction.options.getRole("role_5")
    ].filter(role=>role!==null);

    const emojis = ["🇦","🇧","🇨","🇩","🇪"];

    if(!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({
      embeds:[{
        color: Colors.Red,
        author:{
          name: "権限がありません",
          icon_url: "https://cdn.taka.cf/images/system/error.png"
        },
        description: "このコマンドを実行するには以下の権限を持っている必要があります",
        fields:[
          {
            name: "必要な権限",
            value: "```ロールの管理```"
          }
        ]
      }],
      ephemeral: true
    });

    if(
      !interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ViewChannel)||
      !interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.SendMessages)||
      !interaction.guild.members.me.permissionsIn(interaction.channel).has(PermissionFlagsBits.ManageRoles)
    ) return await interaction.reply({
      embeds:[{
        color: Colors.Red,
        author:{
          name: "BOTに権限がありません",
          icon_url: "https://cdn.taka.cf/images/system/error.png"
        },
        description: "このコマンドはBOTに以下の権限が必要です",
        fields:[
          {
            name: "必要な権限",
            value: "```チャンネルの閲覧\nメッセージの送信\nロールの管理```"
          }
        ]
      }],
      ephemeral: true
    });

    const editable = roles.filter(role=>!role.editable);
    if(editable.length > 0) return await interaction.reply({
      embeds:[{
        color: Colors.Red,
        author:{
          name: "作成できませんでした",
          icon_url: "https://cdn.taka.cf/images/system/error.png"
        },
        description: "以下のロールがBOTより上か、管理されているロールです",
        fields:[
          {
            name: "権限のないロール",
            value: editable.map(role=>`<@&${role.id}>`).join("\n")
          }
        ]
      }],
      ephemeral: true
    });

    try{
      await interaction.channel.send({
        embeds:[{
          color: Colors.Green,
          title: title,
          description: roles.map((r,i)=>`${emojis[i]}<@&${r.id}>`).join("\n")
        }],
        components:[
          new ActionRowBuilder()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("role")
                .setPlaceholder("ロールが選択されていません")
                .setMinValues(0)
                .setMaxValues(roles.length)
                .addOptions(
                  roles.map((r,i)=>({
                    label: `@${r.name}`,
                    value: r.id,
                    emoji:{
                      name: emojis[i]
                    }
                  }))
                ))
        ]
      });

      await interaction.deferReply()
        .then(()=>interaction.deleteReply());
    }catch(error){
      await interaction.reply({
        embeds:[{
          color: Colors.Red,
          author:{
            name: "作成できませんでした",
            icon_url: "https://cdn.taka.cf/images/system/error.png"
          },
          description: "同じロールが選択されているか、BOTの権限が不足しています",
          fields:[
            {
              name: "エラーコード",
              value: `\`\`\`${error}\`\`\``
            }
          ]
        }],
        components:[
          new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel("サポートサーバー")
                .setURL("https://discord.gg/NEesRdGQwD")
                .setStyle(ButtonStyle.Link))
        ],
        ephemeral: true
      });
    }
  }
}