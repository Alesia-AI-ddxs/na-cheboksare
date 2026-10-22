// Вкладка «Сетнер»: бот-рассказчик в Telegram. Код прохождения связывает игру и бота.
import React, { useState } from 'react';
import { View } from 'react-native';
import { CodeBox } from '../../components/CodeBox';
import { SpeakerIcon } from '../../components/Icons';
import { Btn, Card, H, P, Screen } from '../../components/ui';
import { content } from '../../content';
import { openUrl, setnerLink, shareText } from '../../share';
import { useGame } from '../../state/game';

export default function SetnerTab() {
  const { t, tOpt, p } = useGame();
  const [shared, setShared] = useState<string | null>(null);
  const intro = tOpt('ui.setner_intro');
  const tg = setnerLink(content.links.setnerTelegram, p.code);
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <SpeakerIcon layer="sci" size={48} />
        <H size={22} style={{ flex: 1 }}>
          {t('spk.setner')}
        </H>
      </View>
      {intro ? (
        <Card>
          <P>{intro}</P>
        </Card>
      ) : null}
      <CodeBox />
      <View style={{ gap: 10, marginTop: 14 }}>
        <Btn testID="to-bot" kind="volga" label={t('ui.to_bot')} onPress={() => openUrl(tg)} />
        <Btn
          kind="ghost"
          label={shared === 'copied' ? `✓ ${t('ui.share')}` : t('ui.share')}
          onPress={async () => setShared(await shareText(`${t('ui.title')} · ${t('ui.code')}: ${p.code}\n${content.links.webGame ?? ''}`.trim()))}
        />
      </View>
      <P muted style={{ marginTop: 14, fontSize: 13.5 }}>
        {t('ui.voice_soon')}
      </P>
    </Screen>
  );
}
