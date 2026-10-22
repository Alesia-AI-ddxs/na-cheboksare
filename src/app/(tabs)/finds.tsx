// Вкладка «Находки»: все предметы коллекции. Найденные — с названием и описанием, ненайденные — силуэтом.
import React from 'react';
import { Text, View } from 'react-native';
import { ArtifactIcon } from '../../components/Icons';
import { H, P, Screen } from '../../components/ui';
import { artifactList } from '../../content';
import { useGame } from '../../state/game';

export default function FindsTab() {
  const { pal, f, t, tOpt, p } = useGame();
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 18 }}>
        <H size={24}>{t('ui.collection')}</H>
        <Text style={{ color: pal.gold, fontWeight: '700', fontSize: 15 }}>
          {p.found.length}/{artifactList.length}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        {artifactList.map((a) => {
          const has = p.found.includes(a.id);
          const kind = tOpt(`ui.kind_${a.kind}`);
          return (
            <View
              key={a.id}
              testID={`art-${a.id}`}
              style={{
                flexBasis: '46%',
                flexGrow: 1,
                minHeight: 150,
                backgroundColor: pal.panel,
                borderWidth: 1.5,
                borderStyle: has ? 'solid' : 'dashed',
                borderColor: has ? pal.gold : pal.line,
                borderRadius: 14,
                padding: 12,
                alignItems: 'center',
              }}
            >
              <ArtifactIcon icon={a.icon} size={48} dim={!has} />
              {has ? (
                <>
                  <Text style={{ fontFamily: f.display, fontSize: 14.5, color: pal.ink, textAlign: 'center', marginTop: 6 }}>
                    {tOpt(a.nameKey) ?? t('ui.soon')}
                  </Text>
                  {kind ? <Text style={{ color: pal.gold, fontSize: 11, marginTop: 2, fontFamily: f.body }}>{kind}</Text> : null}
                  {tOpt(a.descKey) ? (
                    <P muted style={{ fontSize: 12, lineHeight: 17, marginTop: 4, textAlign: 'center' }}>
                      {tOpt(a.descKey)}
                    </P>
                  ) : null}
                </>
              ) : (
                <Text style={{ color: pal.muted, fontSize: 12.5, marginTop: 8, textAlign: 'center', fontFamily: f.body }}>{t('ui.not_found_yet')}</Text>
              )}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}
