/* jshint -W117 */
/* a simple MUC connection plugin
 * can only handle a single MUC room
 */
Strophe.addConnectionPlugin('emuc', {
    connection: null,
    roomjid: null,
    myroomjid: null,
    members: {},
    list_members: [], // so we can elect a new focus
    presMap: {},
    preziMap: {},
    joined: false,
    isOwner: false,
    role: null,
    init: function (conn) {
        this.connection = conn;
    },
    initPresenceMap: function (myroomjid) {
        this.presMap['to'] = myroomjid;
        this.presMap['xns'] = 'http://jabber.org/protocol/muc';
    },
    doJoin: function (jid, password) {
        this.myroomjid = jid;

        console.info("Joined MUC as " + this.myroomjid);

        this.initPresenceMap(this.myroomjid);

        if (!this.roomjid) {
            this.roomjid = Strophe.getBareJidFromJid(jid);
            // add handlers (just once)
            this.connection.addHandler(this.onPresence.bind(this), null, 'presence', null, null, this.roomjid, {matchBare: true});
            this.connection.addHandler(this.onPresenceUnavailable.bind(this), null, 'presence', 'unavailable', null, this.roomjid, {matchBare: true});
            this.connection.addHandler(this.onPresenceError.bind(this), null, 'presence', 'error', null, this.roomjid, {matchBare: true});
            this.connection.addHandler(this.onMessage.bind(this), null, 'message', null, null, this.roomjid, {matchBare: true});
        }
        if (password !== undefined) {
            this.presMap['password'] = password;
        }
        this.sendPresence();
    },
    doLeave: function() {
        console.log("do leave", this.myroomjid);
        var pres = $pres({to: this.myroomjid, type: 'unavailable' });
        this.presMap.length = 0;
        this.connection.send(pres);
    },
    createNonAnonymousRoom: function() {
        // http://xmpp.org/extensions/xep-0045.html#createroom-reserved

        var getForm = $iq({type: 'get', to: this.roomjid})
            .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'})
            .c('x', {xmlns: 'jabber:x:data', type: 'submit'});

        this.connection.sendIQ(getForm, function (form){

            if (!$(form).find(
                '>query>x[xmlns="jabber:x:data"]' +
                '>field[var="muc#roomconfig_whois"]').length) {

                console.error('non-anonymous rooms not supported');
                return;
            }

            var formSubmit = $iq({to: this.roomjid, type: 'set'})
                .c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});

            formSubmit.c('x', {xmlns: 'jabber:x:data', type: 'submit'});

            formSubmit.c('field', {'var': 'FORM_TYPE'})
                .c('value')
                .t('http://jabber.org/protocol/muc#roomconfig').up().up();

            formSubmit.c('field', {'var': 'muc#roomconfig_whois'})
                .c('value').t('anyone').up().up();

            this.connection.sendIQ(formSubmit);

        }, function (error){
            console.error("Error getting room configuration form");
        });
    },
    onPresence: function (pres) {
        var from = pres.getAttribute('from');

        // What is this for? A workaround for something?
        if (pres.getAttribute('type')) {
            return true;
        }

        // Parse etherpad tag.
        var etherpad = $(pres).find('>etherpad');
        if (etherpad.length) {
            if (config.etherpad_base && !Moderator.isModerator()) {
                UI.initEtherpad(etherpad.text());
            }
        }

        // Parse prezi tag.
        var presentation = $(pres).find('>prezi');
        if (presentation.length)
        {
            var url = presentation.attr('url');
            var current = presentation.find('>current').text();

            console.log('presentation info received from', from, url);

            if (this.preziMap[from] == null) {
                this.preziMap[from] = url;

                $(document).trigger('presentationadded.muc', [from, url, current]);
            }
            else {
                $(document).trigger('gotoslide.muc', [from, url, current]);
            }
        }
        else if (this.preziMap[from] != null) {
            var url = this.preziMap[from];
            delete this.preziMap[from];
            $(document).trigger('presentationremoved.muc', [from, url]);
        }

        // Parse audio info tag.
        var audioMuted = $(pres).find('>audiomuted');
        if (audioMuted.length) {
            $(document).trigger('audiomuted.muc', [from, audioMuted.text()]);
        }

        // Parse video info tag.
        var videoMuted = $(pres).find('>videomuted');
        if (videoMuted.length) {
            $(document).trigger('videomuted.muc', [from, videoMuted.text()]);
        }

        var stats = $(pres).find('>stats');
        if(stats.length)
        {
            var statsObj = {};
            Strophe.forEachChild(stats[0], "stat", function (el) {
                statsObj[el.getAttribute("name")] = el.getAttribute("value");
            });
            ConnectionQuality.updateRemoteStats(from, statsObj);
        }

        // Parse status.
        if ($(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>status[code="201"]').length) {
            this.isOwner = true;
            this.createNonAnonymousRoom();
        }

        // Parse roles.
        var member = {};
        member.show = $(pres).find('>show').text();
        member.status = $(pres).find('>status').text();
        var tmp = $(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>item');
        member.affiliation = tmp.attr('affiliation');
        member.role = tmp.attr('role');

        // Focus recognition
        member.jid = tmp.attr('jid');
        member.isFocus = false;
        if (member.jid
            && member.jid.indexOf(Moderator.getFocusUserJid() + "/") == 0) {
            member.isFocus = true;
        }

        var nicktag = $(pres).find('>nick[xmlns="http://jabber.org/protocol/nick"]');
        member.displayName = (nicktag.length > 0 ? nicktag.html() : null);

        if (from == this.myroomjid) {
            if (member.affiliation == 'owner') this.isOwner = true;
            if (this.role !== member.role) {
                this.role = member.role;
                if(Moderator.onLocalRoleChange)
                    Moderator.onLocalRoleChange(from, member, pres);
                UI.onLocalRoleChange(from, member, pres);
            }
            if (!this.joined) {
                this.joined = true;
                $(document).trigger('joined.muc', [from, member]);
                UI.onMucJoined(from, member);
                this.list_members.push(from);
            }
        } else if (this.members[from] === undefined) {
            // new participant
            this.members[from] = member;
            this.list_members.push(from);
            console.log('entered', from, member);
            if (member.isFocus)
            {
                focusMucJid = from;
                console.info("Ignore focus: " + from +", real JID: " + member.jid);
            }
            else {
                var id = $(pres).find('>userID').text();
                var email = $(pres).find('>email');
                if (email.length > 0) {
                    id = email.text();
                }
                UI.onMucEntered(from, id, member.displayName);
            }
        } else {
            // Presence update for existing participant
            // Watch role change:
            if (this.members[from].role != member.role) {
                this.members[from].role = member.role;
                UI.onMucRoleChanged(member.role, member.displayName);
            }
        }

        // Always trigger presence to update bindings
        $(document).trigger('presence.muc', [from, member, pres]);

        // Trigger status message update
        if (member.status) {
            UI.onMucPresenceStatus(from, member);
        }

        return true;
    },
    onPresenceUnavailable: function (pres) {
        var from = pres.getAttribute('from');
        // Status code 110 indicates that this notification is "self-presence".
        if (!$(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>status[code="110"]').length) {
            delete this.members[from];
            this.list_members.splice(this.list_members.indexOf(from), 1);
            this.onParticipantLeft(from);
        }
        // If the status code is 110 this means we're leaving and we would like
        // to remove everyone else from our view, so we trigger the event.
        else if (this.list_members.length > 1) {
            for (var i = 0; i < this.list_members.length; i++) {
                var member = this.list_members[i];
                delete this.members[i];
                this.list_members.splice(i, 1);
                this.onParticipantLeft(member);
            }
        }
        if ($(pres).find('>x[xmlns="http://jabber.org/protocol/muc#user"]>status[code="307"]').length) {
            $(document).trigger('kicked.muc', [from]);
        }
        return true;
    },
    onPresenceError: function (pres) {
        var from = pres.getAttribute('from');
        if ($(pres).find('>error[type="auth"]>not-authorized[xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"]').length) {
            console.log('on password required', from);

            UI.onPasswordReqiured(function (value) {
                connection.emuc.doJoin(from, value);
            })
        } else if ($(pres).find(
                '>error[type="cancel"]>not-allowed[xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"]').length) {
            var toDomain = Strophe.getDomainFromJid(pres.getAttribute('to'));
            if(toDomain === config.hosts.anonymousdomain) {
                // we are connected with anonymous domain and only non anonymous users can create rooms
                // we must authorize the user
                $(document).trigger('passwordrequired.main');
            } else {
                console.warn('onPresError ', pres);
                UI.messageHandler.openReportDialog(null,
                    'Oops! Something went wrong and we couldn`t connect to the conference.',
                pres);
            }
        } else {
            console.warn('onPresError ', pres);
            UI.messageHandler.openReportDialog(null,
                'Oops! Something went wrong and we couldn`t connect to the conference.',
                pres);
        }
        return true;
    },
    sendMessage: function (body, nickname) {
        var msg = $msg({to: this.roomjid, type: 'groupchat'});
        msg.c('body', body).up();
        if (nickname) {
            msg.c('nick', {xmlns: 'http://jabber.org/protocol/nick'}).t(nickname).up().up();
        }
        this.connection.send(msg);
        if(APIConnector.isEnabled() && APIConnector.isEventEnabled("outgoingMessage"))
        {
            APIConnector.triggerEvent("outgoingMessage", {"message": body});
        }
    },
    setSubject: function (subject){
        var msg = $msg({to: this.roomjid, type: 'groupchat'});
        msg.c('subject', subject);
        this.connection.send(msg);
        console.log("topic changed to " + subject);
    },
    onMessage: function (msg) {
        // FIXME: this is a hack. but jingle on muc makes nickchanges hard
        var from = msg.getAttribute('from');
        var nick = $(msg).find('>nick[xmlns="http://jabber.org/protocol/nick"]').text() || Strophe.getResourceFromJid(from);

        var txt = $(msg).find('>body').text();
        var type = msg.getAttribute("type");
        if(type == "error")
        {
            UI.chatAddError($(msg).find('>text').text(), txt);
            return true;
        }

        var subject = $(msg).find('>subject');
        if(subject.length)
        {
            var subjectText = subject.text();
            if(subjectText || subjectText == "") {
                UI.chatSetSubject(subjectText);
                console.log("Subject is changed to " + subjectText);
            }
        }


        if (txt) {
            console.log('chat', nick, txt);
            UI.updateChatConversation(from, nick, txt);
            if(APIConnector.isEnabled() && APIConnector.isEventEnabled("incomingMessage"))
            {
                if(from != this.myroomjid)
                    APIConnector.triggerEvent("incomingMessage",
                        {"from": from, "nick": nick, "message": txt});
            }
        }
        return true;
    },
    lockRoom: function (key, onSuccess, onError, onNotSupported) {
        //http://xmpp.org/extensions/xep-0045.html#roomconfig
        var ob = this;
        this.connection.sendIQ($iq({to: this.roomjid, type: 'get'}).c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'}),
            function (res) {
                if ($(res).find('>query>x[xmlns="jabber:x:data"]>field[var="muc#roomconfig_roomsecret"]').length) {
                    var formsubmit = $iq({to: ob.roomjid, type: 'set'}).c('query', {xmlns: 'http://jabber.org/protocol/muc#owner'});
                    formsubmit.c('x', {xmlns: 'jabber:x:data', type: 'submit'});
                    formsubmit.c('field', {'var': 'FORM_TYPE'}).c('value').t('http://jabber.org/protocol/muc#roomconfig').up().up();
                    formsubmit.c('field', {'var': 'muc#roomconfig_roomsecret'}).c('value').t(key).up().up();
                    // Fixes a bug in prosody 0.9.+ https://code.google.com/p/lxmppd/issues/detail?id=373
                    formsubmit.c('field', {'var': 'muc#roomconfig_whois'}).c('value').t('anyone').up().up();
                    // FIXME: is muc#roomconfig_passwordprotectedroom required?
                    this.connection.sendIQ(formsubmit,
                        onSuccess,
                        onError);
                } else {
                    onNotSupported();
                }
            }, onError);
    },
    kick: function (jid) {
        var kickIQ = $iq({to: this.roomjid, type: 'set'})
            .c('query', {xmlns: 'http://jabber.org/protocol/muc#admin'})
            .c('item', {nick: Strophe.getResourceFromJid(jid), role: 'none'})
            .c('reason').t('You have been kicked.').up().up().up();

        this.connection.sendIQ(
                kickIQ,
                function (result) {
                    console.log('Kick participant with jid: ', jid, result);
                },
                function (error) {
                    console.log('Kick participant error: ', error);
                });
    },
    sendPresence: function () {
        var pres = $pres({to: this.presMap['to'] });
        pres.c('x', {xmlns: this.presMap['xns']});

        if (this.presMap['password']) {
            pres.c('password').t(this.presMap['password']).up();
        }

        pres.up();

        // Send XEP-0115 'c' stanza that contains our capabilities info
        if (connection.caps) {
            connection.caps.node = config.clientNode;
            pres.c('c', connection.caps.generateCapsAttrs()).up();
        }

        pres.c('user-agent', {xmlns: 'http://jitsi.org/jitmeet/user-agent'})
            .t(navigator.userAgent).up();

        if(this.presMap['bridgeIsDown']) {
            pres.c('bridgeIsDown').up();
        }

        if(this.presMap['email']) {
            pres.c('email').t(this.presMap['email']).up();
        }

        if(this.presMap['userId']) {
            pres.c('userId').t(this.presMap['userId']).up();
        }

        if (this.presMap['displayName']) {
            // XEP-0172
            pres.c('nick', {xmlns: 'http://jabber.org/protocol/nick'})
                .t(this.presMap['displayName']).up();
        }

        if (this.presMap['audions']) {
            pres.c('audiomuted', {xmlns: this.presMap['audions']})
                .t(this.presMap['audiomuted']).up();
        }

        if (this.presMap['videons']) {
            pres.c('videomuted', {xmlns: this.presMap['videons']})
                .t(this.presMap['videomuted']).up();
        }

        if(this.presMap['statsns'])
        {
            var stats = pres.c('stats', {xmlns: this.presMap['statsns']});
            for(var stat in this.presMap["stats"])
                if(this.presMap["stats"][stat] != null)
                    stats.c("stat",{name: stat, value: this.presMap["stats"][stat]}).up();
            pres.up();
        }

        if (this.presMap['prezins']) {
            pres.c('prezi',
                    {xmlns: this.presMap['prezins'],
                    'url': this.presMap['preziurl']})
                    .c('current').t(this.presMap['prezicurrent']).up().up();
        }

        if (this.presMap['etherpadns']) {
            pres.c('etherpad', {xmlns: this.presMap['etherpadns']})
                .t(this.presMap['etherpadname']).up();
        }

        if (this.presMap['medians'])
        {
            pres.c('media', {xmlns: this.presMap['medians']});
            var sourceNumber = 0;
            Object.keys(this.presMap).forEach(function (key) {
                if (key.indexOf('source') >= 0) {
                     sourceNumber++;
                }
            });
            if (sourceNumber > 0)
                for (var i = 1; i <= sourceNumber/3; i ++) {
                    pres.c('source',
                           {type: this.presMap['source' + i + '_type'],
                           ssrc: this.presMap['source' + i + '_ssrc'],
                           direction: this.presMap['source'+ i + '_direction']
                                                    || 'sendrecv' }
                    ).up();
                }
        }

        pres.up();
//        console.debug(pres.toString());
        connection.send(pres);
    },
    addDisplayNameToPresence: function (displayName) {
        this.presMap['displayName'] = displayName;
    },
    addMediaToPresence: function (sourceNumber, mtype, ssrcs, direction) {
        if (!this.presMap['medians'])
            this.presMap['medians'] = 'http://estos.de/ns/mjs';

        this.presMap['source' + sourceNumber + '_type'] = mtype;
        this.presMap['source' + sourceNumber + '_ssrc'] = ssrcs;
        this.presMap['source' + sourceNumber + '_direction'] = direction;
    },
    clearPresenceMedia: function () {
        var self = this;
        Object.keys(this.presMap).forEach( function(key) {
            if(key.indexOf('source') != -1) {
                delete self.presMap[key];
            }
        });
    },
    addPreziToPresence: function (url, currentSlide) {
        this.presMap['prezins'] = 'http://jitsi.org/jitmeet/prezi';
        this.presMap['preziurl'] = url;
        this.presMap['prezicurrent'] = currentSlide;
    },
    removePreziFromPresence: function () {
        delete this.presMap['prezins'];
        delete this.presMap['preziurl'];
        delete this.presMap['prezicurrent'];
    },
    addCurrentSlideToPresence: function (currentSlide) {
        this.presMap['prezicurrent'] = currentSlide;
    },
    getPrezi: function (roomjid) {
        return this.preziMap[roomjid];
    },
    addEtherpadToPresence: function(etherpadName) {
        this.presMap['etherpadns'] = 'http://jitsi.org/jitmeet/etherpad';
        this.presMap['etherpadname'] = etherpadName;
    },
    addAudioInfoToPresence: function(isMuted) {
        this.presMap['audions'] = 'http://jitsi.org/jitmeet/audio';
        this.presMap['audiomuted'] = isMuted.toString();
    },
    addVideoInfoToPresence: function(isMuted) {
        this.presMap['videons'] = 'http://jitsi.org/jitmeet/video';
        this.presMap['videomuted'] = isMuted.toString();
    },
    addConnectionInfoToPresence: function(stats) {
        this.presMap['statsns'] = 'http://jitsi.org/jitmeet/stats';
        this.presMap['stats'] = stats;
    },
    findJidFromResource: function(resourceJid) {
        if(resourceJid && 
            resourceJid === Strophe.getResourceFromJid(connection.emuc.myroomjid)) {
            return connection.emuc.myroomjid;
        }
        var peerJid = null;
        Object.keys(this.members).some(function (jid) {
            peerJid = jid;
            return Strophe.getResourceFromJid(jid) === resourceJid;
        });
        return peerJid;
    },
    addBridgeIsDownToPresence: function() {
        this.presMap['bridgeIsDown'] = true;
    },
    addEmailToPresence: function(email) {
        this.presMap['email'] = email;
    },
    addUserIdToPresence: function(userId) {
        this.presMap['userId'] = userId;
    },
    isModerator: function() {
        return this.role === 'moderator';
    },
    getMemberRole: function(peerJid) {
        if (this.members[peerJid]) {
            return this.members[peerJid].role;
        }
        return null;
    },
    onParticipantLeft: function (jid) {
        UI.onMucLeft(jid);

        if(APIConnector.isEnabled() && APIConnector.isEventEnabled("participantLeft"))
        {
            APIConnector.triggerEvent("participantLeft",{jid: jid});
        }

        delete jid2Ssrc[jid];

        connection.jingle.terminateByJid(jid);

        if (connection.emuc.getPrezi(jid)) {
            $(document).trigger('presentationremoved.muc',
                [jid, connection.emuc.getPrezi(jid)]);
        }

        Moderator.onMucLeft(jid);
    }
});
