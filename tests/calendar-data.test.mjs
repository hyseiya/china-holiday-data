import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const root = new URL('../', import.meta.url)

// Independent transcription of the State Council notices, not generated data.
const official = {
    2026: {
        publishedAt: '2025-11-04',
        documentNumber: '国办发明电〔2025〕7号',
        breaks: [
            ['01-01', '01-03', '元旦'],
            ['02-15', '02-23', '春节'],
            ['04-04', '04-06', '清明节'],
            ['05-01', '05-05', '劳动节'],
            ['06-19', '06-21', '端午节'],
            ['09-25', '09-27', '中秋节'],
            ['10-01', '10-07', '国庆节']
        ],
        makeup: ['01-04', '02-14', '02-28', '05-09', '09-20', '10-10'],
        restCount: 33
    },
    2027: {
        publishedAt: '2026-11-05',
        documentNumber: '国办发明电〔2026〕10号',
        breaks: [
            ['01-01', '01-03', '元旦'],
            ['02-05', '02-13', '春节'],
            ['04-03', '04-05', '清明节'],
            ['05-01', '05-05', '劳动节'],
            ['06-09', '06-09', '端午节'],
            ['09-15', '09-15', '中秋节'],
            ['10-01', '10-07', '国庆节']
        ],
        makeup: ['01-31', '02-14', '05-08', '09-26', '10-09'],
        restCount: 29
    }
}

function load(year) {
    return JSON.parse(readFileSync(new URL(`data/${year}.json`, root), 'utf8'))
}

function expectedRest(year, ranges) {
    return ranges.flatMap(([start, end, holiday]) => {
        const dates = []
        const cursor = new Date(`${year}-${start}T00:00:00Z`)
        const stop = `${year}-${end}`
        while (cursor.toISOString().slice(0, 10) <= stop) {
            dates.push([cursor.toISOString().slice(0, 10), holiday])
            cursor.setUTCDate(cursor.getUTCDate() + 1)
        }
        return dates
    })
}

for (const [yearText, notice] of Object.entries(official)) {
    const year = Number(yearText)

    test(`${year}: complete annual feed matches the documented JSON format`, () => {
        const data = load(year)
        assert.equal(data.year, year)
        assert.equal(data.region, 'CN')
        assert.equal(data.complete, true)
        assert.equal(data.coverageStart, `${year}-01-01`)
        assert.equal(data.coverageEnd, `${year}-12-31`)
        assert.equal(typeof data.version, 'string')
        assert.ok(data.version.trim().length > 0)
        assert.ok(Buffer.byteLength(data.version) <= 200)
        // Keep the human-readable source separate from structured provenance.
        assert.equal(typeof data.source, 'string')
        assert.ok(data.source.trim().length > 0)
        assert.ok(Array.isArray(data.days))
        assert.ok(data.days.length > 0)
    })

    test(`${year}: exactly the announced holiday and makeup dates`, () => {
        const { days } = load(year)
        const expected = expectedRest(year, notice.breaks)
        const rests = days.filter(day => day.kind === 'rest')
        const works = days.filter(day => day.kind === 'work')
        assert.equal(rests.length, notice.restCount)
        assert.deepEqual(rests.map(day => day.date), expected.map(([date]) => date))
        assert.deepEqual(works.map(day => day.date), notice.makeup.map(day => `${year}-${day}`))
        assert.equal(days.length, notice.restCount + notice.makeup.length)
        for (const [date, holiday] of expected) {
            assert.ok(rests.find(day => day.date === date).name.includes(holiday))
        }
    })

    test(`${year}: adjustments are ordered, unique and valid`, () => {
        const { days } = load(year)
        const dates = days.map(day => day.date)
        assert.deepEqual(dates, [...dates].sort())
        assert.equal(new Set(dates).size, dates.length)
        for (const day of days) {
            assert.match(day.date, new RegExp(`^${year}-\\d{2}-\\d{2}$`))
            assert.equal(new Date(`${day.date}T00:00:00Z`).toISOString().slice(0, 10), day.date)
            assert.ok(['rest', 'work'].includes(day.kind))
            if (day.kind === 'work') {
                assert.ok([0, 6].includes(new Date(`${day.date}T00:00:00Z`).getUTCDay()))
            }
            assert.equal(typeof day.name, 'string')
            assert.ok(day.name.trim().length > 0)
            assert.ok([...day.name].length <= 500)
        }
    })

    test(`${year}: provenance identifies the official notice`, () => {
        const { sourceMetadata: source } = load(year)
        assert.equal(typeof source.title, 'string')
        assert.ok(source.title.includes(`${year}年`))
        assert.ok(source.title.includes('节假日安排'))
        const url = new URL(source.url)
        assert.equal(url.protocol, 'https:')
        assert.ok(['gov.cn', 'xinhuanet.com', 'news.cn', 'people.com.cn'].some(
            domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
        ))
        assert.equal(source.publishedAt, notice.publishedAt)
        assert.equal(source.documentNumber, notice.documentNumber)
    })
}

test('unannounced 2028 has no fabricated annual feed', () => {
    assert.equal(existsSync(new URL('data/2028.json', root)), false)
})
